#!/usr/bin/env python3

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "data" / "company_snapshots.json"
OUTPUT_PATH = ROOT / "data" / "stocks.json"


OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "").strip().lower()


SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "bucket": {
            "type": "string",
            "enum": ["Short Term", "Long Term", "Watchlist"],
        },
        "stability": {
            "type": "string",
            "enum": ["High", "Medium", "Needs Review"],
        },
        "evidence": {
            "type": "array",
            "minItems": 3,
            "maxItems": 3,
            "items": {"type": "string"},
        },
    },
    "required": ["bucket", "stability", "evidence"],
}


def load_snapshots():
    return json.loads(SOURCE_PATH.read_text())


def numeric_like(value):
    if isinstance(value, (int, float)):
        return float(value)

    cleaned = "".join(ch for ch in str(value) if ch.isdigit() or ch in ".-")
    if not cleaned:
        return None

    try:
        return float(cleaned)
    except ValueError:
        return None


def compute_score(stock):
    score = 50
    debt_value = numeric_like(stock["debtToEquity"])
    roe_value = numeric_like(stock["roe"])

    if stock["profitStatus"] == "Profitable":
        score += 12
    else:
        score -= 18

    if stock["operatingCashFlow"] == "Positive":
        score += 10
    elif stock["operatingCashFlow"] == "Negative":
        score -= 10

    if stock["volumeBucket"] == "Volume Spike":
        score += 8
    elif stock["volumeBucket"] == "High Volume":
        score += 6
    else:
        score -= 4

    if stock["stability"] == "High":
        score += 14
    elif stock["stability"] == "Medium":
        score += 5
    else:
        score -= 10

    if debt_value is not None:
        if debt_value <= 0.3:
            score += 10
        elif debt_value <= 1.2:
            score += 3
        elif debt_value > 3:
            score -= 8

    if roe_value is not None:
        if roe_value >= 20:
            score += 10
        elif roe_value >= 12:
            score += 5
        elif roe_value < 8:
            score -= 6

    if stock["bucket"] == "Long Term":
        score += 8
    elif stock["bucket"] == "Short Term":
        score += 5

    return max(1, min(99, round(score)))


def fallback_classification(stock):
    debt_value = numeric_like(stock["debtToEquity"])
    roe_value = numeric_like(stock["roe"])

    if stock["profitStatus"] == "Loss-making" or stock["operatingCashFlow"] == "Negative":
        stability = "Needs Review"
    elif debt_value is not None and debt_value <= 0.3 and roe_value is not None and roe_value >= 15:
        stability = "High"
    elif debt_value is not None and debt_value <= 1.5:
        stability = "Medium"
    else:
        stability = "Needs Review"

    if stock["profitStatus"] == "Loss-making":
        bucket = "Watchlist"
    elif stock["volumeBucket"] == "Volume Spike":
        bucket = "Short Term"
    elif stability == "High":
        bucket = "Long Term"
    else:
        bucket = "Watchlist"

    evidence = list(stock["highlights"][:3])
    if len(evidence) < 3:
        evidence.extend(stock["risks"][: 3 - len(evidence)])

    while len(evidence) < 3:
        evidence.append("Review the latest filings and recent price action before acting.")

    return {
        "bucket": bucket,
        "stability": stability,
        "evidence": evidence[:3],
    }


def build_prompt(stock):
    payload = {
        "name": stock["name"],
        "symbol": stock["symbol"],
        "sector": stock["sector"],
        "priceBucket": stock["priceBucket"],
        "volumeBucket": stock["volumeBucket"],
        "profitStatus": stock["profitStatus"],
        "revenueTrend": stock["revenueTrend"],
        "netProfitTrend": stock["netProfitTrend"],
        "debtToEquity": stock["debtToEquity"],
        "operatingCashFlow": stock["operatingCashFlow"],
        "roe": stock["roe"],
        "promoterPledge": stock["promoterPledge"],
        "highlights": stock["highlights"],
        "risks": stock["risks"],
    }
    return (
        "You are helping build a stock watchlist site for older non-technical users. "
        "Return only JSON matching the schema. "
        "Pick one bucket: Short Term, Long Term, or Watchlist. "
        "Choose stability as High, Medium, or Needs Review. "
        "Write exactly three short evidence bullets in plain English. "
        "Be conservative. If risks are meaningful, prefer Watchlist or Needs Review.\n\n"
        f"Stock snapshot:\n{json.dumps(payload, ensure_ascii=True)}"
    )


def call_openai(prompt):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")

    body = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": "You produce concise JSON for stock watchlist cards."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "stock_card_summary",
                "strict": True,
                "schema": SCHEMA,
            },
        },
    }

    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(request) as response:
        payload = json.loads(response.read().decode("utf-8"))

    content = payload["choices"][0]["message"]["content"]
    return json.loads(content)


def schema_to_gemini(schema):
    schema_type = schema["type"].upper()
    converted = {"type": schema_type}

    if "enum" in schema:
        converted["enum"] = schema["enum"]

    if schema_type == "OBJECT":
        converted["properties"] = {
            key: schema_to_gemini(value) for key, value in schema.get("properties", {}).items()
        }
        converted["required"] = schema.get("required", [])
    elif schema_type == "ARRAY":
        converted["items"] = schema_to_gemini(schema["items"])
        if "minItems" in schema:
            converted["minItems"] = schema["minItems"]
        if "maxItems" in schema:
            converted["maxItems"] = schema["maxItems"]

    return converted


def call_gemini(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
            "responseSchema": schema_to_gemini(SCHEMA),
        },
    }

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={api_key}"
    )
    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request) as response:
        payload = json.loads(response.read().decode("utf-8"))

    text = payload["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)


def classify(stock):
    prompt = build_prompt(stock)

    if LLM_PROVIDER == "openai":
        return call_openai(prompt)
    if LLM_PROVIDER == "gemini":
        return call_gemini(prompt)

    return fallback_classification(stock)


def build_output():
    output = []
    for stock in load_snapshots():
        try:
            ai_fields = classify(stock)
        except (RuntimeError, urllib.error.URLError, urllib.error.HTTPError, KeyError, IndexError, json.JSONDecodeError) as exc:
            print(f"Falling back for {stock['symbol']}: {exc}", file=sys.stderr)
            ai_fields = fallback_classification(stock)

        merged = dict(stock)
        merged.update(ai_fields)
        merged["recommendationScore"] = compute_score(merged)
        output.append(merged)

    output.sort(key=lambda item: item["recommendationScore"], reverse=True)
    OUTPUT_PATH.write_text(json.dumps(output, indent=2))
    print(f"Wrote {len(output)} stocks to {OUTPUT_PATH}")


if __name__ == "__main__":
    build_output()
