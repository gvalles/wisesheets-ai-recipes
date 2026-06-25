# Wisesheets Fundamental Stock Dashboard

A React + Vite financial dashboard powered by the Wisesheets API.

This folder contains the code behind the live dashboard:

https://wisesheets-terminal.wisesheets-i-9103.chatgpt-team.site

Use it as a starting point for AI-assisted dashboard experiments: add your Wisesheets API key, run it locally, then ask your AI coding agent to customize the metrics, layout, workflows, or deployment target.

## Get A Free Wisesheets API Key

Get a free API key here:

https://www.wisesheets.io/api

Official API docs:

https://www.wisesheets.io/api/docs

## What It Includes

- Searchable ticker/company input with Wisesheets company suggestions
- Live fundamentals dashboard with five-year trend views
- KPI cards, health scoring, margin charts, cash-flow quality, balance strength, statements, and insight panels
- Server-side API proxy so the browser never calls Wisesheets directly
- Mock mode fallback for UI development without live API calls
- `AGENTS.md` with instructions for AI coding agents
- `CUSTOMIZE.md` with copy-paste prompts for common modifications

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Edit `.env`:

```bash
WISESHEETS_API_KEY=your_key_here
```

Open the local URL printed by Vite.

## How API Calls Work

The frontend calls:

```txt
/api/wisesheets/...
```

Local development uses the Vite proxy. Hosted deployments can use:

- `api/wisesheets/[...path].js` on Vercel
- `worker/index.js` on Cloudflare/Sites

Both paths forward requests to:

```txt
https://api.wisesheets.io
```

If `WISESHEETS_API_KEY` is set, the proxy adds:

```txt
Authorization: Bearer <key>
```

Keep the key server-side. Do not paste it into React components or browser-exposed config.

## Useful Commands

```bash
npm run dev
npm run build
npm run preview
```

## Main Files

- `src/App.tsx` - dashboard UI and data loading
- `src/lib/api.ts` - Wisesheets API client helpers
- `src/lib/rules.ts` - scoring and insight logic
- `src/lib/mock.ts` - fallback mock data
- `api/wisesheets/[...path].js` - Vercel serverless API proxy
- `worker/index.js` - production API proxy and static asset worker
- `AGENTS.md` - coding-agent instructions
- `CUSTOMIZE.md` - starter prompts for modifications

## Deploying

Any deployment target must preserve the server-side proxy pattern. Configure the API key as a server/runtime environment variable named:

```txt
WISESHEETS_API_KEY
```

Do not use `VITE_` for the API key. `VITE_` variables are exposed to browser code.

### Deploy On Vercel

This folder is ready to deploy on Vercel.

Use these settings when importing the GitHub repo:

```txt
Repository: gvalles/wisesheets-ai-recipes
Root Directory: fundamental-stock-dashboard
Framework preset: Vite
Build command: npm run build
Output directory: dist
Environment variable: WISESHEETS_API_KEY
```

After deploy, the frontend will keep calling `/api/wisesheets/...`, and Vercel will handle that with `api/wisesheets/[...path].js`.

## AI Coding Agent Prompt

```txt
Read README.md, AGENTS.md, CUSTOMIZE.md, and the official API docs at https://www.wisesheets.io/api/docs. Help me customize this Wisesheets dashboard. Keep API keys server-side and use the existing /api/wisesheets proxy.
```
