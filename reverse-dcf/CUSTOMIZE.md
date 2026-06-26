# Customize This Recipe

Use these prompts with your AI coding agent after adding your Wisesheets API key.

## Change The Valuation Model

```txt
Read README.md, AGENTS.md, index.html, and api/proxy.js. Add a scenario option for 10-year explicit DCF forecasts while keeping the existing 5-year mode as the default. Preserve the server-side Wisesheets proxy and keep the mobile layout clean.
```

## Add New Metrics

```txt
Read the Wisesheets API docs and this recipe. Add ROIC, gross margin, and operating margin to the analysis using Wisesheets financial metrics. Show them as compact stats without exposing the API key to the browser.
```

## Improve The Search Workflow

```txt
Improve the company search experience in index.html. Keep the existing /api/proxy/companies endpoint, preserve keyboard navigation, and add a recent-tickers list stored in localStorage.
```

## Add Exporting

```txt
Add a client-side export button that downloads the current ticker, assumptions, implied growth, scenario values, and source years as CSV. Do not include the API key or raw proxy headers.
```

## Rebrand The UI

```txt
Rebrand the reverse DCF app for my firm. Keep the current valuation workflow and Wisesheets proxy, but update colors, typography, title copy, and footer language. Verify desktop and mobile layouts.
```

## Deploy

```txt
Prepare this recipe for Vercel production deployment. Confirm WISESHEETS_API_KEY is configured as a server-side Production environment variable, then run a production deploy and verify the live proxy endpoints.
```

