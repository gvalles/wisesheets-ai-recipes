# Agent Instructions

This recipe is a single-page reverse DCF app powered by the Wisesheets API.

## Before Editing

Read these files first:

- `README.md`
- `CUSTOMIZE.md`
- `index.html`
- `api/proxy.js`
- Official API docs: https://www.wisesheets.io/api/docs

## Architecture

- `index.html` contains the full UI, styles, and client-side valuation logic.
- `api/proxy.js` is the server-side Wisesheets proxy for Vercel.
- `vercel.json` rewrites `/api/proxy/*` to the proxy function.
- `local-dev.mjs` mirrors the Vercel route locally without requiring Vercel login.

## API Key Rule

Keep `WISESHEETS_API_KEY` server-side.

Do not add browser-exposed API keys, including:

```txt
VITE_WISESHEETS_API_KEY
NEXT_PUBLIC_WISESHEETS_API_KEY
WISESHEETS_API_KEY in index.html
```

The browser should only call:

```txt
/api/proxy/...
```

## Design Constraints

- Preserve the current dark valuation-tool interface unless the user explicitly asks for a redesign.
- Keep the app usable on mobile and desktop.
- Check mobile controls after changing scenario inputs or chart labels.
- Avoid adding framework dependencies unless the user asks to migrate the app.

## Valuation Constraints

- Treat reverse DCF output as educational, not investment advice.
- Do not silently smooth over negative or zero FCF history.
- Keep data freshness visible when changing price or fundamentals handling.
- Prefer explicit warnings over hiding unreliable CAGR math.

## Verification

Run these checks before finishing:

```bash
npm install
npm run dev:local
```

Then verify:

- `/api/proxy/companies?q=AAPL&limit=1`
- `/api/proxy/financials?tickers=AAPL&period=last5y&frequency=annual&layout=long&metrics=free_cash_flow`
- `/api/proxy/prices/eod?tickers=AAPL&period=latest&fields=close`

