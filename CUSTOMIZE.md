# Catalog Customization Prompts

Use these prompts when editing the Wisesheets AI Recipes repo with an AI coding agent.

## Add A New Recipe Folder

```txt
Read README.md, AGENTS.md, index.html, and data/recipes.json. Add a new Wisesheets recipe as a complete project folder named <folder-name>/. Link users to https://www.wisesheets.io/api for a free key and https://www.wisesheets.io/api/docs for API docs. Do not add bundled API markdown or secrets.
```

## Improve The Catalog Page

```txt
Read README.md and AGENTS.md. Improve index.html as a polished static recipe gallery. Keep it framework-free, fast, responsive, and easy to scan. Do not introduce a build step.
```

## Add A Recipe Card

```txt
Read data/recipes.json and index.html. Add a new card for <recipe name> that links to the local folder, lists the stack, lists the Wisesheets endpoints used, and explains how users power it with WISESHEETS_API_KEY.
```

## Make The Repo Easier For AI Agents

```txt
Read all root docs and dashboard-starter docs. Tighten the instructions for AI coding agents. Make the free API key flow explicit with https://www.wisesheets.io/api and keep API docs linked to https://www.wisesheets.io/api/docs.
```
