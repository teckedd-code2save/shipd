# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Shipd Does

Shipd is a chat-first deployment planning SaaS. It analyzes GitHub repositories and recommends which hosting platform (Railway, Fly.io, Vercel, Render) best fits the repo. It does **not** deploy code, store secrets, or modify repositories — it only produces plans and recommendations.

Core user flow: authenticate with GitHub → pick a repo → trigger scan → get platform recommendations → chat with AI for follow-up questions.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint

npm run db:migrate   # Run Prisma migrations + regenerate client
npm run db:push      # Push schema changes to DB without migration
npm run db:generate  # Regenerate Prisma client only
```

There is no test script configured.

## Environment Variables

Create `.env.local` with:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shipd
AUTH_SECRET=<any-random-string>
AUTH_GITHUB_ID=<github-oauth-app-id>
AUTH_GITHUB_SECRET=<github-oauth-app-secret>
AI_PROVIDER=openai           # or "anthropic"
OPENAI_API_KEY=<key>
OPENAI_MODEL=gpt-4-turbo-preview
ANTHROPIC_API_KEY=<key>      # only needed if AI_PROVIDER=anthropic
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

If `DATABASE_URL` is absent, auth falls back to JWT sessions with no data persistence. `AUTH_SECRET` defaults to a dev-only constant if missing.

## Architecture

### Analysis Pipeline

The core feature is a deterministic pipeline in `src/server/services/analysis-service.ts`:

```
GitHub files → scanRepositoryFiles() → classifyRepository() → matchArchetypes() → scorePlatforms() → createPlanFromSnapshot()
```

1. **Parsing** (`src/lib/parsing/`) — extracts signals from files (framework, runtime, CI, platform configs, etc.)
2. **Classification** (`src/lib/classification/`) — assigns a `RepoClass` (e.g. `deployable_web_app`, `python_service`, `infra_only`)
3. **Archetypes** (`src/lib/archetypes/`) — matches the repo to known deployment patterns (e.g. "Next.js + Vercel")
4. **Scoring** (`src/lib/scoring/`) — runs platform-specific rules against extracted signals, producing a score (0–100) and verdict (`perfect`/`good`/`viable`/`weak`/`poor`)

Results are persisted to PostgreSQL via Prisma and loaded from cache on repeat visits.

### AI / Chat Layer

`src/lib/ai/orchestrator.ts` drives chat. It:
- Resolves a task type from the user's message
- Selects a provider (OpenAI or Anthropic) via `src/lib/ai/registry.ts`
- Produces a structured deployment plan object + a streamed natural language response

The AI receives the full analysis context (signals, classifications, archetypes, scores, findings) as a prompt.

### Service Layer

`src/server/services/` contains business logic:
- `analysis-service.ts` — main orchestrator (cache-or-compute, persist)
- `chat-service.ts` — chat message handling
- `github-scan-source.ts` — fetches repo file tree from GitHub API
- `repository-service.ts` — CRUD for user repos
- `github-account-service.ts` — retrieves the user's GitHub OAuth token

### Pages (App Router)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Repo browser; triggers scans via server action `runRepositoryScanAction` |
| `/chat/[repoId]` | Main workspace: chat, plan, scan summary |
| `/scan/[repoId]` | Detailed findings and evidence |
| `/comparison/[repoId]` | Side-by-side platform comparison |

All data-fetching pages are Server Components; interactivity is in client components under `src/components/`.

### Database Schema Key Models

`Repository` → `Scan` → `ScanFinding` + `ScanEvidence` + `RepoClassification` + `ArchetypeMatch` + `PlatformScore` → `DeploymentPlan`

Feedback is tracked via `RecommendationFeedback` and `OutcomeEvent`. Algorithm versioning is tracked via `RecommendationVersion` (current: `v2-deterministic-initial`).

### Native Modules

`next.config.ts` marks `tree-sitter` and its language grammars as `serverExternalPackages` — they run only server-side and must not be imported in client components or edge runtime.
