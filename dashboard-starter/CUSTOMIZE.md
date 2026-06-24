# Customization Prompts

Use these prompts with your AI coding agent after adding your Wisesheets API key.

## Valuation Dashboard

```txt
Read README.md, AGENTS.md, and the official Wisesheets API docs at https://www.wisesheets.io/api/docs. Modify this dashboard to focus on valuation and profitability. Keep API calls behind /api/wisesheets and do not expose WISESHEETS_API_KEY in browser code. Add valuation-focused KPI cards and update the scoring logic accordingly.
```

## Compare Two Companies

```txt
Read README.md, AGENTS.md, and the official Wisesheets API docs at https://www.wisesheets.io/api/docs. Add a comparison mode where I can select two tickers and compare revenue, margins, free cash flow, ROE, debt/equity, and balance strength over the last five years.
```

## Industry Screener

```txt
Read README.md, AGENTS.md, and the official Wisesheets API docs at https://www.wisesheets.io/api/docs. Turn this into a lightweight company screener. Add filters for exchange, industry/SIC description, growth, margin, and debt/equity. Keep all API requests routed through /api/wisesheets.
```

## Export Data

```txt
Read README.md, AGENTS.md, and the official Wisesheets API docs at https://www.wisesheets.io/api/docs. Add CSV export buttons for KPI data, trend data, and statements. Keep the existing dashboard layout and add export controls where they fit naturally.
```

## Deploy

```txt
Read README.md and AGENTS.md. Help me deploy this app. Preserve the server-side Wisesheets proxy and configure WISESHEETS_API_KEY as a runtime secret, not a browser environment variable.
```

## Redesign

```txt
Read README.md and AGENTS.md. Redesign the dashboard for a cleaner portfolio-manager workflow. Keep the app dense and data-first. Preserve live data, search suggestions, mock fallback, and the /api/wisesheets proxy.
```
