# Portfolio Tracker

A planned template for tracking holdings, exposure, company fundamentals, and aggregate portfolio quality.

## Best For

- Personal portfolio dashboards
- Client portfolio reports
- Watchlists
- Monitoring workflows

## Wisesheets Endpoints

- `GET /v1/companies?q=<query>`
- `GET /v1/financials/`
- `GET /v1/statements/:ticker`

## Suggested Features

- Add holdings and weights
- Aggregate portfolio revenue growth and margins
- Flag companies with weak balance sheets
- Export a portfolio report
- Compare holdings across sectors

## Agent Prompt

```txt
Read README.md, AGENTS.md, and WISESHEETS_API.md. Customize this portfolio tracker for my holdings. Keep WISESHEETS_API_KEY server-side.
```

