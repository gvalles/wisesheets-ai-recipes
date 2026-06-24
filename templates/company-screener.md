# Company Screener

A planned template for screening companies by fundamentals, exchange, industry/SIC description, growth, margin, and balance sheet quality.

## Best For

- Stock discovery
- Watchlist generation
- Fundamental filters
- Advisor or analyst workflows

## Wisesheets Endpoints

- `GET /v1/companies?q=<query>`
- `GET /v1/financials/`

## Suggested Features

- Search and filter companies
- Save watchlists locally or server-side
- Sort by growth, margin, ROE, and leverage
- Export results to CSV
- AI-generated screen summaries

## Agent Prompt

```txt
Read README.md, AGENTS.md, and WISESHEETS_API.md. Build or customize a Wisesheets screener. Keep API keys server-side and route API calls through /api/wisesheets.
```

