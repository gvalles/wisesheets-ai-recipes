# Wisesheets Reverse DCF Recipe

This is a Vercel-ready recipe that uses the Wisesheets API behind a serverless proxy. The frontend is a single static `index.html` file and the backend is a Vercel function at `/api/proxy/*`.

## What it does

- Searches public companies through Wisesheets
- Pulls 5 years of annual financial history
- Pulls the latest end-of-day price
- Computes implied free-cash-flow growth with a reverse DCF
- Shows scenario analysis, historical context, and sensitivity tables
- Supports shareable URLs such as `/?ticker=AAPL&wacc=9&tgr=3&termMode=gordon`

## Deploy on Vercel

1. Import this folder into Vercel.
2. Add the environment variable `WISESHEETS_API_KEY`.
3. Deploy.

The app serves `index.html` at the root and uses the serverless route `/api/proxy/*` for Wisesheets requests.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Add your Wisesheets API key to `.env.local`.

4. Start the local compatibility server:

```bash
npm run dev:local
```

Open `http://localhost:3000`.

You can also run the app with Vercel's local runtime:

```bash
npm run dev
```

That may require Vercel CLI authentication.

## Notes

- The proxy only allows the Wisesheets endpoints used by this recipe.
- Secrets stay on the server side through the Vercel function.
- This example is intended as a deployable recipe, not investment advice.
