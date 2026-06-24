# Wisesheets AI Recipes

Buildable Wisesheets app recipes for AI coding agents.

This repo contains complete project folders that people can clone, open with an AI coding agent, modify, and power with their own Wisesheets API key.

## Get A Free API Key

Get a free Wisesheets API key here:

https://www.wisesheets.io/api

Official API docs:

https://www.wisesheets.io/api/docs

## Recipes

| Recipe | Status | Folder | Live Demo |
| --- | --- | --- | --- |
| Fundamental Stock Dashboard | Live | [`fundamental-stock-dashboard/`](fundamental-stock-dashboard/) | https://wisesheets-terminal.wisesheets-i-9103.chatgpt-team.site |
| Company Screener | Planned | `company-screener/` | - |
| Portfolio Tracker | Planned | `portfolio-tracker/` | - |
| Excel Add-in Starter | Planned | `excel-addin-starter/` | - |

## How People Use This Repo

1. Clone this repo.
2. Choose a recipe folder, starting with `fundamental-stock-dashboard/`.
3. Copy that folder into their own project or work directly inside it.
4. Get a free key from https://www.wisesheets.io/api.
5. Create `.env` in the recipe folder:

```bash
WISESHEETS_API_KEY=your_key_here
```

6. Run the recipe.
7. Ask their AI coding agent to read the recipe `README.md`, `AGENTS.md`, `CUSTOMIZE.md`, and the official API docs.

## Current Live Recipe

The `fundamental-stock-dashboard/` folder contains the code behind this live dashboard:

https://wisesheets-terminal.wisesheets-i-9103.chatgpt-team.site

## Folder Standard

Each complete recipe folder should include:

```txt
README.md
AGENTS.md
CUSTOMIZE.md
.env.example
package.json
src/
```

Optional depending on the recipe:

```txt
worker/
public/
```

Do not include local secrets or deployment-specific files.

## API Key Rule

Wisesheets API keys must stay server-side.

Use:

```txt
WISESHEETS_API_KEY=...
```

Do not use:

```txt
VITE_WISESHEETS_API_KEY=...
```

Variables prefixed with `VITE_` are exposed to browser code.

## Adding More Recipes

Future projects should be added as sibling folders:

```txt
company-screener/
portfolio-tracker/
excel-addin-starter/
```

When adding a recipe:

- Add a complete project folder.
- Add `.env.example`.
- Ignore `.env`, `.env.local`, `node_modules/`, `dist/`, and generated files.
- Link to https://www.wisesheets.io/api/docs instead of bundling API docs.
- Update `README.md`, `index.html`, and `data/recipes.json`.

## License

MIT. Wisesheets API access requires your own Wisesheets account and API key.
