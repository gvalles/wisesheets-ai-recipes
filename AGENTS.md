# AI Coding Agent Instructions

This repository is the catalog hub for Wisesheets starter projects and recipes.

## Purpose

Help users find a template, clone it, add a Wisesheets API key, and customize it with an AI coding agent.

## Keep This Repo Simple

This repo should stay lightweight:

- Static catalog page in `index.html`
- Recipe metadata in `data/templates.json`
- One Markdown detail page per recipe in `templates/`
- No build system unless it becomes necessary

## Editing Rules

- Do not add real API keys.
- Do not add generated build artifacts.
- Keep recipe links consistent between `README.md`, `index.html`, `data/templates.json`, and `templates/*.md`.
- Prefer plain HTML/CSS for the catalog until there is a clear need for a framework.
- Keep copy written for builders using AI coding agents.

## Recipe Metadata

When adding a recipe, update `data/templates.json` with:

- `name`
- `slug`
- `status`
- `description`
- `repo`
- `demo`
- `stack`
- `apiEndpoints`
- `bestFor`
- `difficulty`
- `agentPrompt`

## Validation

Because this is a static hub, validation is mostly content review:

- Open `index.html`.
- Check all links.
- Confirm JSON parses.
- Confirm no secrets are present.
