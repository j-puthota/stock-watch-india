#!/usr/bin/env python3

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "company_snapshots.json"


STOCK_UNIVERSE = [
    ("Reliance Industries", "RELIANCE", "Energy"),
    ("TCS", "TCS", "Information Technology"),
    ("HDFC Bank", "HDFCBANK", "Banking"),
    ("ICICI Bank", "ICICIBANK", "Banking"),
    ("Infosys", "INFY", "Information Technology"),
    ("ITC", "ITC", "Consumer Staples"),
    ("Bharti Airtel", "BHARTIARTL", "Telecom"),
    ("Larsen & Toubro", "LT", "Infrastructure"),
    ("Hindustan Unilever", "HINDUNILVR", "Consumer Staples"),
    ("State Bank of India", "SBI", "Banking"),
    ("Axis Bank", "AXISBANK", "Banking"),
    ("Kotak Mahindra Bank", "KOTAKBANK", "Banking"),
    ("Bajaj Finance", "BAJFINANCE", "Financial Services"),
    ("Asian Paints", "ASIANPAINT", "Consumer"),
    ("Maruti Suzuki", "MARUTI", "Automobile"),
    ("Sun Pharmaceutical", "SUNPHARMA", "Pharmaceuticals"),
    ("Titan Company", "TITAN", "Retail"),
    ("UltraTech Cement", "ULTRACEMCO", "Cement"),
    ("Tata Motors", "TATAMOTORS", "Automobile"),
    ("NTPC", "NTPC", "Utilities"),
    ("Power Grid Corporation", "POWERGRID", "Utilities"),
    ("Tata Steel", "TATASTEEL", "Metals"),
    ("JSW Steel", "JSWSTEEL", "Metals"),
    ("Mahindra & Mahindra", "M&M", "Automobile"),
    ("Wipro", "WIPRO", "Information Technology"),
    ("Nestle India", "NESTLEIND", "Consumer Staples"),
    ("HCL Technologies", "HCLTECH", "Information Technology"),
    ("Tech Mahindra", "TECHM", "Information Technology"),
    ("Adani Ports", "ADANIPORTS", "Infrastructure"),
    ("ONGC", "ONGC", "Energy"),
    ("Coal India", "COALINDIA", "Mining"),
    ("Hindalco Industries", "HINDALCO", "Metals"),
    ("Dr Reddy's Laboratories", "DRREDDY", "Pharmaceuticals"),
    ("SBI Life Insurance", "SBILIFE", "Insurance"),
    ("Grasim Industries", "GRASIM", "Industrials"),
    ("Cipla", "CIPLA", "Pharmaceuticals"),
    ("Divi's Laboratories", "DIVISLAB", "Pharmaceuticals"),
    ("Britannia Industries", "BRITANNIA", "Consumer Staples"),
    ("Hero MotoCorp", "HEROMOTOCO", "Automobile"),
    ("Eicher Motors", "EICHERMOT", "Automobile"),
    ("Bajaj Auto", "BAJAJ-AUTO", "Automobile"),
    ("Bajaj Finserv", "BAJAJFINSV", "Financial Services"),
    ("BPCL", "BPCL", "Energy"),
    ("IndusInd Bank", "INDUSINDBK", "Banking"),
    ("Apollo Hospitals", "APOLLOHOSP", "Healthcare"),
    ("Adani Enterprises", "ADANIENT", "Industrials"),
    ("Tata Consumer Products", "TATACONSUM", "Consumer Staples"),
    ("Tata Power", "TATAPOWER", "Utilities"),
    ("Trent", "TRENT", "Retail"),
    ("Eternal", "ETERNAL", "Internet Consumer"),
    ("Indian Railway Finance Corporation", "IRFC", "Financial Services"),
    ("Hindustan Aeronautics", "HAL", "Defence"),
    ("Bharat Electronics", "BEL", "Defence"),
    ("Rail Vikas Nigam", "RVNL", "Infrastructure"),
    ("Suzlon Energy", "SUZLON", "Renewable Energy"),
    ("Vodafone Idea", "IDEA", "Telecom"),
    ("Dabur India", "DABUR", "Consumer Staples"),
    ("Godrej Consumer Products", "GODREJCP", "Consumer Staples"),
    ("Pidilite Industries", "PIDILITIND", "Chemicals"),
    ("Shriram Finance", "SHRIRAMFIN", "Financial Services"),
    ("REC", "RECLTD", "Financial Services"),
    ("Power Finance Corporation", "PFC", "Financial Services"),
    ("Mankind Pharma", "MANKIND", "Pharmaceuticals"),
    ("Indian Hotels", "INDHOTEL", "Hospitality"),
    ("TVS Motor Company", "TVSMOTOR", "Automobile"),
    ("Bosch", "BOSCHLTD", "Industrials"),
    ("Cummins India", "CUMMINSIND", "Industrials"),
    ("DLF", "DLF", "Real Estate"),
    ("SBI Cards", "SBICARD", "Financial Services"),
    ("Aurobindo Pharma", "AUROPHARMA", "Pharmaceuticals"),
    ("Bandhan Bank", "BANDHANBNK", "Banking"),
    ("Canara Bank", "CANBK", "Banking"),
    ("Bank of Baroda", "BANKBARODA", "Banking"),
    ("Punjab National Bank", "PNB", "Banking"),
    ("IDFC First Bank", "IDFCFIRSTB", "Banking"),
    ("Indian Oil Corporation", "IOC", "Energy"),
    ("GAIL India", "GAIL", "Energy"),
    ("Vedanta", "VEDL", "Metals"),
    ("NMDC", "NMDC", "Mining"),
    ("Ambuja Cements", "AMBUJACEM", "Cement"),
    ("ACC", "ACC", "Cement"),
    ("Jubilant FoodWorks", "JUBLFOOD", "Consumer"),
    ("Siemens India", "SIEMENS", "Industrials"),
    ("ABB India", "ABB", "Industrials"),
    ("BHEL", "BHEL", "Industrials"),
    ("LIC", "LICI", "Insurance"),
    ("Colgate-Palmolive India", "COLPAL", "Consumer Staples"),
    ("Page Industries", "PAGEIND", "Consumer"),
    ("Avenue Supermarts", "DMART", "Retail"),
    ("Adani Green Energy", "ADANIGREEN", "Renewable Energy"),
    ("Adani Energy Solutions", "ADANIENSOL", "Utilities"),
    ("UPL", "UPL", "Chemicals"),
    ("Torrent Pharmaceuticals", "TORNTPHARM", "Pharmaceuticals"),
    ("Lupin", "LUPIN", "Pharmaceuticals"),
    ("MRF", "MRF", "Automobile"),
    ("ICICI Lombard", "ICICIGI", "Insurance"),
    ("HDFC Life", "HDFCLIFE", "Insurance"),
    ("Max Healthcare", "MAXHEALTH", "Healthcare"),
    ("Persistent Systems", "PERSISTENT", "Information Technology"),
    ("LTIMindtree", "LTIM", "Information Technology"),
    ("Varun Beverages", "VBL", "Consumer Staples"),
    ("CG Power", "CGPOWER", "Industrials"),
    ("Samvardhana Motherson", "MOTHERSON", "Automobile"),
    ("NHPC", "NHPC", "Utilities"),
    ("Union Bank of India", "UNIONBANK", "Banking"),
    ("IRCTC", "IRCTC", "Travel"),
    ("PB Fintech", "POLICYBZR", "Financial Services"),
    ("PI Industries", "PIIND", "Chemicals"),
    ("Tata Communications", "TATACOMM", "Telecom"),
    ("Oracle Financial Services", "OFSS", "Information Technology"),
    ("SRF", "SRF", "Chemicals"),
    ("Bharat Forge", "BHARATFORG", "Industrials"),
]


SECTOR_RULES = {
    "Banking": {"debt": 1.9, "roe": 15, "price_mod": 1.0},
    "Information Technology": {"debt": 0.15, "roe": 22, "price_mod": 1.1},
    "Energy": {"debt": 0.7, "roe": 16, "price_mod": 0.9},
    "Consumer Staples": {"debt": 0.25, "roe": 19, "price_mod": 1.0},
    "Infrastructure": {"debt": 0.8, "roe": 14, "price_mod": 1.0},
    "Financial Services": {"debt": 2.1, "roe": 16, "price_mod": 0.85},
    "Consumer": {"debt": 0.35, "roe": 18, "price_mod": 1.05},
    "Automobile": {"debt": 0.6, "roe": 17, "price_mod": 1.0},
    "Pharmaceuticals": {"debt": 0.2, "roe": 18, "price_mod": 1.1},
    "Utilities": {"debt": 1.25, "roe": 13, "price_mod": 0.8},
    "Metals": {"debt": 0.85, "roe": 15, "price_mod": 0.9},
    "Mining": {"debt": 0.35, "roe": 14, "price_mod": 0.7},
    "Insurance": {"debt": 0.2, "roe": 14, "price_mod": 0.95},
    "Industrials": {"debt": 0.45, "roe": 17, "price_mod": 1.0},
    "Healthcare": {"debt": 0.3, "roe": 16, "price_mod": 1.05},
    "Defence": {"debt": 0.1, "roe": 20, "price_mod": 1.15},
    "Renewable Energy": {"debt": 0.55, "roe": 15, "price_mod": 0.7},
    "Internet Consumer": {"debt": 0.1, "roe": 10, "price_mod": 0.85},
    "Hospitality": {"debt": 0.5, "roe": 13, "price_mod": 0.9},
    "Real Estate": {"debt": 0.95, "roe": 12, "price_mod": 0.85},
    "Chemicals": {"debt": 0.35, "roe": 18, "price_mod": 1.0},
    "Retail": {"debt": 0.25, "roe": 17, "price_mod": 1.2},
    "Travel": {"debt": 0.15, "roe": 16, "price_mod": 0.9},
    "Telecom": {"debt": 1.8, "roe": 11, "price_mod": 0.75},
}


LOSS_MAKERS = {"IDEA", "POLICYBZR"}
VOLATILE = {"SUZLON", "RVNL", "ADANIENT", "IDEA", "POLICYBZR"}


def inr(value):
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


def volume_bucket(index):
    if index % 6 == 0:
        return "Volume Spike"
    if index % 11 == 0:
        return "Low Liquidity"
    return "High Volume"


def price_for(index, sector):
    band = index % 4
    mod = SECTOR_RULES.get(sector, {"price_mod": 1.0})["price_mod"]

    if band == 0:
        base = 38 + (index % 19) * 2.8
    elif band == 1:
        base = 120 + (index % 25) * 11
    elif band == 2:
        base = 620 + (index % 30) * 34
    else:
        base = 2100 + (index % 28) * 110

    return round(base * mod, 2)


def build_highlights(name, sector, volume_signal, profit_status):
    lines = [
        f"{sector} exposure keeps {name} on the review list.",
        f"{volume_signal} helps explain why the stock is drawing attention.",
    ]

    if profit_status == "Profitable":
        lines.append("Profitability gives the card a stronger base case.")
    else:
        lines.append("Losses mean this stock needs extra caution despite the interest.")

    return lines


def build_risks(sector, debt_ratio, symbol):
    if symbol in VOLATILE:
        return ["Sentiment can swing quickly, so this name needs closer monitoring."]
    if debt_ratio > 1.5:
        return ["Higher leverage means balance sheet quality should be checked carefully."]
    if sector in {"Metals", "Energy", "Automobile"}:
        return ["Sector cycles can change sentiment and margins quickly."]
    return ["Review the latest filings and management commentary before acting."]


def build_row(index, entry):
    name, symbol, sector = entry
    rules = SECTOR_RULES.get(sector, {"debt": 0.5, "roe": 15, "price_mod": 1.0})

    price = price_for(index, sector)
    day_change = round((((index * 17) % 65) - 32) / 10, 1)
    previous_close = round(price / (1 + day_change / 100), 2) if day_change != -100 else price
    high_52w = round(price * (1.12 + (index % 7) * 0.03), 2)
    low_52w = round(price * (0.68 - (index % 5) * 0.025), 2)
    week_high = round(price * (1.01 + (index % 3) * 0.012), 2)
    week_low = round(price * (0.97 - (index % 3) * 0.008), 2)

    profit_status = "Loss-making" if symbol in LOSS_MAKERS or index % 29 == 0 else "Profitable"
    volume_signal = volume_bucket(index)
    debt_ratio = round(rules["debt"] + ((index % 5) - 2) * 0.12, 2)
    debt_label = "Very High" if profit_status == "Loss-making" and debt_ratio > 1.4 else f"{max(debt_ratio, 0):.2f}"

    roe_value = round(rules["roe"] + ((index % 7) - 3) * 1.4, 1)
    roe_label = "Negative" if profit_status == "Loss-making" and symbol in LOSS_MAKERS else f"{max(roe_value, 4):.1f}%"

    if profit_status == "Loss-making":
        cash_flow = "Negative" if symbol in LOSS_MAKERS else "Mixed"
        net_profit = "Negative"
    else:
        cash_flow = "Mixed" if index % 8 == 0 else "Positive"
        net_profit = "Improving" if index % 9 == 0 else f"Up {6 + (index % 12)}% YoY"

    revenue_trend = "Flat" if profit_status == "Loss-making" and index % 2 == 0 else f"Up {5 + (index % 14)}% YoY"
    promoter_pledge = "Not Ideal" if symbol in LOSS_MAKERS else ("Low" if index % 13 == 0 else "0%")

    return {
        "name": name,
        "symbol": symbol,
        "sector": sector,
        "price": inr(price),
        "previousClose": inr(previous_close),
        "dayChange": day_change,
        "priceBucket": price_bucket(price),
        "volumeBucket": volume_signal,
        "profitStatus": profit_status,
        "revenueTrend": revenue_trend,
        "netProfitTrend": net_profit,
        "debtToEquity": debt_label,
        "operatingCashFlow": cash_flow,
        "roe": roe_label,
        "promoterPledge": promoter_pledge,
        "high52w": inr(high_52w),
        "low52w": inr(max(low_52w, price * 0.5)),
        "weekHigh": inr(week_high),
        "weekLow": inr(max(week_low, price * 0.9)),
        "highlights": build_highlights(name, sector, volume_signal, profit_status),
        "risks": build_risks(sector, debt_ratio, symbol),
    }


def main():
    rows = [build_row(index, entry) for index, entry in enumerate(STOCK_UNIVERSE, start=1)]
    OUTPUT_PATH.write_text(json.dumps(rows, indent=2))
    print(f"Wrote {len(rows)} company snapshots to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
