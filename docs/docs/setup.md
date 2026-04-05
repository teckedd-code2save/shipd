---
id: setup
title: Local Setup
sidebar_position: 2
---

# Local Setup

## Prerequisites

- Node.js 20+
- PostgreSQL (local or remote)
- GitHub OAuth App — [create one here](https://github.com/settings/developers)
- OpenAI or Anthropic API key

## Install

```bash
git clone https://github.com/teckedd-code2save/shipd.git
cd shipd
npm install
```

## Configure environment

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

## Database

Push the Prisma schema to your database:

```bash
npm run db:push
```

For tracked migrations (recommended for production):

```bash
npm run db:migrate
```

## Start

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## GitHub OAuth setup

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Set **Homepage URL** to `http://localhost:3000`
3. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret** into your `.env.local`

## Scripts reference

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to DB (no migration file) |
| `npm run db:migrate` | Run Prisma dev migrations |
