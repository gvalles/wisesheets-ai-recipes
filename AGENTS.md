# AI Coding Agent Instructions

This repository is a folder-based collection of Wisesheets AI recipes.

Each recipe folder is a complete project that users can run, modify, and power with their own Wisesheets API key.

## Official API Sources

- Free API key: https://www.wisesheets.io/api
- Official API docs: https://www.wisesheets.io/api/docs

Do not rely on bundled API markdown files. Recipe docs should link to the official docs.

## Repo Structure

```txt
dashboard-starter/
data/recipes.json
index.html
README.md
AGENTS.md
CUSTOMIZE.md
```

Future complete projects should be added as sibling folders:

```txt
company-screener/
portfolio-tracker/
excel-addin-starter/
```

## Rules

- Do not commit real API keys.
- Do not bundle local API reference markdown files.
- Keep API docs linked to https://www.wisesheets.io/api/docs.
- Keep `.env` and `.env.local` ignored.
- Keep deployment-specific files out of shared recipe folders.
- Update root `README.md`, `index.html`, and `data/recipes.json` when adding a new recipe.

## Recipe Requirements

Each runnable recipe should include:

```txt
README.md
AGENTS.md
CUSTOMIZE.md
.env.example
package.json
src/
```

## Validation

For each app recipe:

```bash
npm run build
```

For this root catalog:

- Open `index.html`.
- Confirm `data/recipes.json` parses.
- Confirm all links are accurate.
- Confirm no secrets are present.
