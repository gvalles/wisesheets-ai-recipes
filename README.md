# Wisesheets AI Recipes

A browsable catalog of buildable app recipes for creating financial tools with the Wisesheets API and AI coding agents.

Use this repo as the hub. Each recipe can point to a GitHub template repository so users can click **Use this template**, add their Wisesheets API key, and customize the project with their AI coding agent.

## Browse

Open `index.html` locally, or publish this repo with GitHub Pages.

Recommended GitHub Pages setup:

1. Create `gvalles/wisesheets-ai-recipes`.
2. Push this repo.
3. Go to **Settings -> Pages**.
4. Set source to `main` branch and root folder.
5. Share the published Pages URL.

## Recipe Repositories

| Recipe | Status | Best For | Repo |
| --- | --- | --- | --- |
| Dashboard Starter | Ready locally | Fundamentals dashboards, investor tools | `gvalles/wisesheets-dashboard-starter` |
| Company Screener | Planned | Screening companies by metrics and industry | `gvalles/wisesheets-company-screener` |
| Portfolio Tracker | Planned | Tracking holdings and portfolio fundamentals | `gvalles/wisesheets-portfolio-tracker` |
| Excel Add-in Starter | Planned | Spreadsheet-native workflows | `gvalles/wisesheets-excel-addin-starter` |

## User Flow

1. Browse the catalog.
2. Pick a recipe.
3. Click **Use this template** on GitHub.
4. Add a local `.env` file:

```bash
WISESHEETS_API_KEY=your_key_here
```

5. Run the project.
6. Open it in Cursor, Codex, Claude Code, Replit, or another AI coding agent.
7. Ask the agent to read `README.md`, `AGENTS.md`, `CUSTOMIZE.md`, and the Wisesheets API docs before modifying code.

## Standard Recipe Contract

Every starter repo linked from a recipe should include:

```txt
README.md
AGENTS.md
CUSTOMIZE.md
.env.example
package.json
src/
```

Recommended when relevant:

```txt
WISESHEETS_API.md
worker/
public/
```

## API Key Rule

Wisesheets API keys must stay server-side.

Do:

```txt
WISESHEETS_API_KEY=...
```

Do not:

```txt
VITE_WISESHEETS_API_KEY=...
```

Variables prefixed with `VITE_` are exposed to browser code.

## Recipe Checklist

Before publishing a new recipe:

- Add `.env.example`.
- Ignore `.env` and `.env.local`.
- Add `AGENTS.md`.
- Add `CUSTOMIZE.md`.
- Run the build command.
- Confirm no real API key is committed.
- Mark the linked GitHub repo as a template when it is a copyable app starter.
- Add the recipe to `data/templates.json`.
- Add a recipe detail page in `templates/`.

## Suggested Repo Naming

```txt
gvalles/wisesheets-ai-recipes
gvalles/wisesheets-dashboard-starter
gvalles/wisesheets-company-screener
gvalles/wisesheets-portfolio-tracker
gvalles/wisesheets-excel-addin-starter
```

## License

MIT. Wisesheets API access requires your own Wisesheets account and API key.
