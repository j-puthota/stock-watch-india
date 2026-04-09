# Stock Watch India Demo

A lightweight static prototype for an Indian stock watchlist web app aimed at older, non-technical users.

## What it includes

- Senior-friendly stock cards with large type and plain language
- Buckets for `Short Term`, `Long Term`, and `Watchlist`
- Filters for price range, volume, profitability, and stability
- Financial health markers such as profitability, revenue trend, net profit trend, debt to equity, operating cash flow, ROE, promoter pledge, previous close, and 52-week high/low
- 5-day high and low inside expandable details so the main card stays readable
- Demo evidence summaries to explain why each stock is on the list
- A section describing how to build and host it with near-zero cost
- A GitHub Actions workflow that can rebuild `data/stocks.json` once per day

## Files

- `index.html` contains the page structure
- `styles.css` contains the layout and visual design
- `app.js` loads `data/stocks.json` and handles client-side filtering
- `data/company_snapshots.json` contains the base stock inputs
- `data/stocks.json` contains the generated card data shown on the site
- `scripts/generate_stocks.py` builds `data/stocks.json`
- `.github/workflows/update-stocks.yml` runs the daily refresh

## How to run

Because this app now loads JSON, use a local server instead of opening the HTML file directly:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Important note

The stock figures in `data/company_snapshots.json` are demo values for the prototype layout and should be replaced with real market and filing data before public use.

## Daily GitHub Action

The workflow in `.github/workflows/update-stocks.yml` runs on weekdays and can also be triggered manually from the `Actions` tab.

### Recommended setup

1. Push the repository to GitHub.
2. In GitHub, open `Settings` -> `Secrets and variables` -> `Actions`.
3. Add one of these repository variables:

```text
LLM_PROVIDER=openai
```

or

```text
LLM_PROVIDER=gemini
```

4. Add the matching secret:

```text
OPENAI_API_KEY
```

or

```text
GEMINI_API_KEY
```

5. Optional variables:

```text
OPENAI_MODEL=gpt-4o-mini
GEMINI_MODEL=gemini-2.0-flash
```

### What the workflow does

- reads `data/company_snapshots.json`
- uses OpenAI, Gemini, or a built-in fallback classifier
- writes the final card file to `data/stocks.json`
- commits the updated JSON back to the repository

### Important architecture note

OpenAI and Gemini are best used for:

- bucket classification
- stability labeling
- plain-English evidence summaries

They should not be treated as the source of truth for market prices, volume, or company financials. In a real setup, feed those numeric values into `data/company_snapshots.json` from a market-data or filings source first, then let the AI write the summaries.
