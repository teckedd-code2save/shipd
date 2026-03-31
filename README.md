# Shipd

Shipd is a chat-first deployment planning app. Connect a GitHub repo, inspect deployment signals across the codebase, compare realistic hosting options, and generate a deployment plan before touching infra or code.

![Shipd home](docs/screenshots/home-current.png)

## What It Does

- Connects to GitHub with read-only access
- Syncs repositories into a searchable deployment workspace
- Scans deployment-relevant files such as `package.json`, `Dockerfile`, workflows, env files, platform config, and infra folders
- Scores platforms like Railway, Fly.io, Vercel, and Render against detected repo signals
- Produces a saved deployment plan, comparison view, and scan evidence trail

## Product Snapshots

### Landing

![Shipd landing page](docs/screenshots/home-current.png)

### Dashboard

![Shipd authenticated dashboard](docs/screenshots/dashboard-live.png)

### Deployment Plan

![Shipd deployment planning workspace](docs/screenshots/plan-live.png)

### Platform Comparison

![Shipd platform comparison view](docs/screenshots/comparison-live.png)

## Stack

- Next.js 16
- React 19
- Auth.js with GitHub OAuth
- Prisma + PostgreSQL
- Tailwind CSS
- Provider-agnostic AI orchestration with OpenAI or Anthropic adapters

## Local Setup

1. Install dependencies.
2. Configure environment variables.
3. Push the Prisma schema.
4. Start the app.

```bash
npm install
npm run db:push
npm run dev
```

## Required Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shipd
AUTH_SECRET=your_auth_secret
AUTH_GITHUB_ID=your_github_oauth_client_id
AUTH_GITHUB_SECRET=your_github_oauth_client_secret

AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

If you want to use Anthropic instead:

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

## Scripts

- `npm run dev` starts the local app
- `npm run build` builds the production bundle
- `npm run lint` runs ESLint
- `npm run db:generate` generates Prisma client
- `npm run db:push` pushes schema changes to Postgres
- `npm run db:migrate` runs Prisma dev migrations

## Current Scope

Shipd is deliberately planning-first:

- no code changes
- no platform write access
- no deploy execution
- no secret storage

It focuses on repo-aware deployment analysis, side-by-side comparison, and clearer decision-making for teams shipping with AI coding agents.
