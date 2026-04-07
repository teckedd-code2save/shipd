# Shipd

**Repo-aware deployment planning for AI-first teams.**

Shipd reads a GitHub repository, scores hosting platforms against detected deployment signals, and produces a plan with blockers, tradeoffs, and step-by-step setup — before you touch infrastructure or change code.

→ [Docs](./docs) · [Local setup](#local-setup)

---

## What it does

- Connects to GitHub with read-only OAuth access
- Scans deployment-relevant files: `package.json`, `Dockerfile`, CI workflows, env files, platform configs, infra folders
- Detects framework, runtime, topology, and deployment pattern
- Scores 11 platforms: Railway, Fly.io, Vercel, Render, Azure Container Apps, AWS App Runner, GCP Cloud Run, Heroku, DigitalOcean, Netlify, Docker + VPS
- Produces a saved deployment plan, platform comparison, and scan evidence trail
- Chat interface for follow-up questions, blockers, and tradeoffs

Shipd does **not** modify code, execute deployments, store secrets, or open pull requests.

---

## Stack

| Layer | Technology |
|---|---|
| App framework | Next.js 15 (App Router) |
| UI | React 19, custom CSS |
| Auth | Auth.js with GitHub OAuth |
| Database | PostgreSQL + Prisma |
| AI | OpenAI or Anthropic (provider-agnostic adapter) |

---

## Local setup

### Prerequisites

- Node.js 20+
- PostgreSQL (local or remote)
- GitHub OAuth App
- OpenAI or Anthropic API key

### Steps

```bash
git clone https://github.com/teckedd-code2save/shipd.git
cd shipd
npm install
```

Copy and fill in environment variables:

```bash
cp .env.example .env.local
```

Push the database schema and start the dev server:

```bash
npm run db:push
npm run dev
```

App runs at `http://localhost:3000`.

---

## Environment variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shipd

# Auth
AUTH_SECRET=any-random-string
AUTH_GITHUB_ID=your-github-oauth-client-id
AUTH_GITHUB_SECRET=your-github-oauth-client-secret

# AI provider — pick one
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini

# Anthropic (alternative)
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your-anthropic-api-key
# ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

If `DATABASE_URL` is absent, auth falls back to JWT-only sessions with no data persistence.

---

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint

npm run db:migrate   # Run Prisma migrations + regenerate client
npm run db:push      # Push schema to DB without a migration file
npm run db:generate  # Regenerate Prisma client only
```

---

## Docs

Full documentation lives in [`/docs`](./docs) and is served by Docusaurus.

```bash
cd docs
npm install
npm start
```

---

## Architecture overview

```
GitHub files
    │
    ▼
scanRepositoryFiles()      ← deterministic parser (framework, runtime, signals)
    │
    ▼
classifyRepository()       ← repo class (web app, service, CLI tool, etc.)
    │
    ▼
matchArchetypes()          ← pattern matching (Next.js app, .NET solution, etc.)
    │
    ▼
scorePlatforms()           ← 11 platform rules → score + verdict + reasons
    │
    ▼
createPlanFromSnapshot()   ← deployment plan with blockers, warnings, next steps
    │
    ▼
PostgreSQL (cached)        ← served on repeat visits without re-scanning
```

AI extraction (`extractRepoSignals`) runs first and falls back to the deterministic pipeline if the LLM call fails.

See [`/docs`](./docs) for detailed architecture, scoring rules, and contribution guide.
