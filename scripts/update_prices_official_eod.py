#!/usr/bin/env python3

import csv
import io
import json
import os
import urllib.error
import urllib.request
import zipfile
from datetime import date, datetime, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = ROOT / "data" / "company_snapshots.json"

# NSE CM UDiFF bhavcopy location (official archive path).
NSE_CM_URL = "https://nsearchives.nseindia.com/content/cm/BhavCopy_NSE_CM_0_0_0_{yyyymmdd}_F_0000.csv.zip"

# BSE zip path is optional in this script. Kept for future extension by scrip-code mapping.
BSE_EQ_URL = "https://www.bseindia.com/download/BhavCopy/Equity/EQ{ddmmyy}_CSV.ZIP"

LOOKBACK_DAYS = int(os.getenv("EOD_LOOKBACK_DAYS", "7"))
TARGET_DATE_ENV = os.getenv("EOD_TARGET_DATE", "").strip()


def normalize_key(value):
    return "".join(ch.lower() for ch in str(value) if ch.isalnum())


def parse_float(value):
    try:
        return float(str(value).replace(",", "").replace("%", ""))
    except (TypeError, ValueError):
        return None


def to_inr(value):
    if value is None:
        return None
    if value >= 100:
        return f"Rs{value:,.0f}"
    if value >= 10:
        return f"Rs{value:.1f}".replace(".0", "")
    return f"Rs{value:.2f}".rstrip("0").rstrip(".")


def price_bucket(price):
    if price < 100:
        return "Under Rs100"
    if price < 500:
        return "Rs100-500"
    if price < 2000:
        return "Rs500-2000"
    return "Above Rs2000"


def volume_bucket(volume):
    if volume is None:
        return None
    if volume >= 20_000_000:
        return "High Volume"
    if volume <= 1_500_000:
        return "Low Liquidity"
    return None


def request_bytes(url):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; StockWatchIndia/1.0)",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Connection": "close",
        },
        method="GET",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def extract_csv_from_zip(raw):
    with zipfile.ZipFile(io.BytesIO(raw)) as zf:
        csv_members = [name for name in zf.namelist() if name.lower().endswith(".csv")]
        if not csv_members:
            raise RuntimeError("Zip file does not contain a CSV.")
        with zf.open(csv_members[0]) as fh:
            return fh.read().decode("utf-8-sig", errors="replace")


def iter_candidate_dates():
    if TARGET_DATE_ENV:
        target = datetime.strptime(TARGET_DATE_ENV, "%Y-%m-%d").date()
    else:
        target = date.today()

    for offset in range(LOOKBACK_DAYS + 1):
        day = target - timedelta(days=offset)
        yield day


def load_nse_rows():
    errors = []

    for day in iter_candidate_dates():
        yyyymmdd = day.strftime("%Y%m%d")
        url = NSE_CM_URL.format(yyyymmdd=yyyymmdd)

        try:
            raw = request_bytes(url)
            csv_text = extract_csv_from_zip(raw)
            rows = list(csv.DictReader(io.StringIO(csv_text)))
            if not rows:
                errors.append(f"{day.isoformat()} -> empty CSV")
                continue
            print(f"Loaded NSE CM bhavcopy for {day.isoformat()} from {url}")
            return day, rows
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, zipfile.BadZipFile, RuntimeError) as exc:
            errors.append(f"{day.isoformat()} -> {exc}")
            continue

    raise RuntimeError("Could not fetch NSE bhavcopy from archive URLs.\n" + "\n".join(errors))


def row_lookup(row):
    return {normalize_key(k): v for k, v in row.items()}


def pick(row, keys):
    for key in keys:
        value = row.get(normalize_key(key))
        if value not in (None, ""):
            return value
    return None


def build_nse_quote_map(rows):
    quote_map = {}

    for raw_row in rows:
        row = row_lookup(raw_row)
        symbol = pick(row, ["TckrSymb", "SYMBOL", "Symbol"])
        if not symbol:
            continue

        series = pick(row, ["SctySrs", "SERIES", "Series"])
        if series and str(series).upper() != "EQ":
            continue

        close = parse_float(pick(row, ["ClsPric", "CLOSE", "Close", "LAST"]))
        prev_close = parse_float(pick(row, ["PrvsClsgPric", "PREVCLOSE", "PrevClose"]))
        high = parse_float(pick(row, ["HghPric", "HIGH", "High"]))
        low = parse_float(pick(row, ["LwPric", "LOW", "Low"]))
        volume = parse_float(pick(row, ["TtlTradgVol", "TOTTRDQTY", "VOLUME", "TOTTRDVAL"]))

        if close is None:
            continue

        change_percent = None
        if prev_close and prev_close > 0:
            change_percent = round(((close - prev_close) / prev_close) * 100, 2)

        quote_map[str(symbol).strip()] = {
            "close": close,
            "prev_close": prev_close,
            "high": high,
            "low": low,
            "volume": volume,
            "change_percent": change_percent,
        }

    return quote_map


def apply_updates(snapshots, quote_map, trade_date):
    updated = 0
    missing = []

    for stock in snapshots:
        symbol = stock.get("symbol")
        if symbol not in quote_map:
            missing.append(symbol)
            continue

        quote = quote_map[symbol]
        close = quote["close"]
        stock["price"] = to_inr(close)
        stock["priceBucket"] = price_bucket(close)

        if quote["prev_close"] is not None:
            stock["previousClose"] = to_inr(quote["prev_close"])
        if quote["change_percent"] is not None:
            stock["dayChange"] = round(quote["change_percent"], 1)
        if quote["high"] is not None:
            stock["weekHigh"] = to_inr(quote["high"])
        if quote["low"] is not None:
            stock["weekLow"] = to_inr(quote["low"])

        volume_signal = volume_bucket(quote["volume"])
        if volume_signal:
            stock["volumeBucket"] = volume_signal

        stock["priceUpdatedOn"] = trade_date.isoformat()
        stock["marketDataSource"] = "NSE CM Bhavcopy (EOD)"
        updated += 1

    return updated, missing


def main():
    snapshots = json.loads(SNAPSHOT_PATH.read_text())
    trade_date, rows = load_nse_rows()
    quote_map = build_nse_quote_map(rows)

    updated, missing = apply_updates(snapshots, quote_map, trade_date)
    SNAPSHOT_PATH.write_text(json.dumps(snapshots, indent=2))

    print(f"Updated {updated}/{len(snapshots)} symbols using official NSE EOD data for {trade_date.isoformat()}.")
    if missing:
        print(f"Symbols not found in bhavcopy: {len(missing)}")
        print(", ".join(sorted([sym for sym in missing if sym])[:30]))


if __name__ == "__main__":
    main()
