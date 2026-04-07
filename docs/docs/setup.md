---
id: setup
title: Setup
sidebar_position: 2
---

# Setup

## Hosted version

Shipd is live at **[shipd-seven.vercel.app](https://shipd-seven.vercel.app)** — sign in with GitHub and start scanning repositories immediately. No local setup needed.

---

## Run locally

### Prerequisites

- Node.js 20.x (required — tree-sitter native modules don't compile on Node 22+)
- PostgreSQL (local or remote)
- GitHub OAuth App — [create one here](https://github.com/settings/developers)
- OpenAI or Anthropic API key

### Install

```bash
git clone https://github.com/teckedd-code2save/shipd.git
cd shipd
npm install
```

### Configure environment

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shipd

# Auth
AUTH_SECRET=any-random-string-32-chars
AUTH_GITHUB_ID=your-github-oauth-client-id
AUTH_GITHUB_SECRET=your-github-oauth-client-secret

# AI provider — pick one
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini

# Anthropic alternative
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your-anthropic-api-key
# ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

:::info
If `DATABASE_URL` is absent, Shipd falls back to JWT-only sessions with no data persistence. Auth still works but scans and plans are not saved.
:::

### Database

Apply the schema:

```bash
npm run db:push
```

Or use tracked migrations (recommended if contributing):

```bash
npm run db:migrate
```

### Start

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### GitHub OAuth setup

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set **Homepage URL** to `http://localhost:3000`
3. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret** into your `.env.local`

---

## Deploy your own instance

Shipd deploys on Vercel with a managed PostgreSQL database.

### 1. Fork and connect

Fork [teckedd-code2save/shipd](https://github.com/teckedd-code2save/shipd) and import it at [vercel.com/new](https://vercel.com/new).

### 2. Provision a database

Choose any managed PostgreSQL provider:

| Provider | Note |
|---|---|
| [Neon](https://neon.tech) | Generous free tier, serverless Postgres |
| [Prisma Postgres](https://www.prisma.io/postgres) | Zero-config if using Prisma |
| [Supabase](https://supabase.com) | Postgres + auth + storage |
| [Railway](https://railway.app) | One-click Postgres, co-located with app |

### 3. Set environment variables

Add these in Vercel → Settings → Environment Variables:

```env
DATABASE_URL=<your-managed-postgres-url>
AUTH_SECRET=<openssl rand -hex 32>
AUTH_GITHUB_ID=<oauth-client-id>
AUTH_GITHUB_SECRET=<oauth-client-secret>
AI_PROVIDER=openai
OPENAI_API_KEY=<your-key>
OPENAI_MODEL=gpt-4.1-mini
```

### 4. Run migrations

After the first deploy, run migrations against the live database from your local machine:

```bash
vercel env pull .env.production.local --environment=production
dotenv -f .env.production.local run -- npx prisma migrate deploy
```

### 5. Update GitHub OAuth callback

Update your GitHub OAuth App's **Authorization callback URL** to your Vercel domain:

```
https://your-app.vercel.app/api/auth/callback/github
```

---

## Scripts reference

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to DB (no migration file) |
| `npm run db:migrate` | Run Prisma dev migrations |
