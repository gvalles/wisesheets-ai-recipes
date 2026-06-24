# AI Coding Agent Instructions

This is the Wisesheets fundamental stock dashboard. Preserve the server-side API proxy and keep API keys out of browser code.

## Official API Sources

- Free API key: https://www.wisesheets.io/api
- Official API docs: https://www.wisesheets.io/api/docs

Do not rely on bundled API markdown. Use the official docs for endpoint details.

## Architecture

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Charts: Recharts
- API proxy:
  - Local dev: Vite proxy in `vite.config.ts`
  - Hosted/prod: `worker/index.js`

## Non-Negotiables

- Never hardcode a real Wisesheets API key in `src/`.
- Never expose the key through `VITE_*`.
- Frontend API calls should go through `/api/wisesheets`.
- Keep `.env` ignored.
- Use `.env.example` for documenting required keys.
- Run `npm run build` after code changes.

## Wisesheets API Pattern

Frontend code should call helpers in `src/lib/api.ts`.

Use:

```txt
/api/wisesheets/v1/financials/
/api/wisesheets/v1/statements/:ticker
/api/wisesheets/v1/companies?q=<query>
```

The proxy strips `/api/wisesheets` and forwards to `https://api.wisesheets.io`.

## Common Change Areas

- Dashboard layout: `src/App.tsx`
- Metrics and API periods: `metricsAll` and `loadAll()` in `src/App.tsx`
- Search suggestions: `searchCompanies()` in `src/lib/api.ts`
- Scoring rules: `src/lib/rules.ts`
- Mock responses: `src/lib/mock.ts`
- Production proxy: `worker/index.js`

## Build And Validate

```bash
npm run build
```

For UI checks:

```bash
npm run dev
```

Then open the local Vite URL.

## Good Agent Behavior

- Check https://www.wisesheets.io/api/docs before changing API shapes.
- Prefer small, focused changes.
- Update `README.md` or `CUSTOMIZE.md` when adding user-facing setup.
- Preserve existing visual density and dashboard style unless explicitly asked to redesign.
- Do not commit `.env`, generated `dist/`, `node_modules/`, or `*.tsbuildinfo`.
