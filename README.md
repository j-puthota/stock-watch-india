# Stock Watch India Demo

A lightweight static prototype for an Indian stock watchlist web app aimed at older, non-technical users.

## What it includes

- Senior-friendly stock cards with large type and plain language
- Buckets for `Short Term`, `Long Term`, and `Watchlist`
- Filters for price range, volume, profitability, and stability
- Financial health markers such as:
  - profitability
  - revenue trend
  - net profit trend
  - debt to equity
  - operating cash flow
  - ROE
  - promoter pledge
- Demo evidence summaries to explain why each stock is on the list
- A section describing how to build and host it with near-zero cost

## Files

- `index.html` contains the page structure
- `styles.css` contains the layout and visual design
- `app.js` contains demo data and client-side filtering

## How to run

Because this is a static app, you can open `index.html` directly in a browser or serve it locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Important note

The stock figures in `app.js` are demo values for the prototype layout and should be replaced with real market and filing data before public use.
