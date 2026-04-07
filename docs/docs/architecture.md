---
id: architecture
title: Architecture
sidebar_position: 3
---

# Architecture

## Analysis pipeline

Every repository scan runs through a deterministic pipeline:

```
GitHub files
    │
    ▼
extractRepoSignals()       ← LLM-first extraction (OpenAI / Anthropic)
    │  fallback ↓
scanRepositoryFiles()      ← deterministic file parser
    │
    ▼
classifyRepository()       ← assigns RepoClass
    │
    ▼
matchArchetypes()          ← matches deployment patterns
    │
    ▼
scorePlatforms()           ← 11 platform rules → score + verdict + reasons
    │
    ▼
createPlanFromSnapshot()   ← plan with blockers, migration steps, provider suggestions
    │
    ▼
PostgreSQL (cached)        ← served on repeat visits without re-scanning
```

### LLM extraction vs deterministic fallback

The pipeline tries `extractRepoSignals()` first — it sends the file tree and key file contents to an LLM and parses the structured JSON response. If that call fails or times out, `scanRepositoryFiles()` runs the deterministic parser over the same file map.

Both paths produce the same `RepoSignals` shape so all downstream logic is identical.

## Layers

### Parsing (`src/lib/parsing/`)

Extracts facts from individual files. Each parser is a pure function:

```
(filePath, content) → { signals, findings, evidence }
```

**Files scanned:** `package.json`, `Dockerfile`, `.env.*`, `prisma/schema.prisma`, `drizzle.config.*`, Python project files, Go modules (`go.mod`), Ruby (`Gemfile`), Java (`pom.xml`, `build.gradle`), Rust (`Cargo.toml`), PHP (`composer.json`), .NET (`.csproj`, `.sln`), CI workflows, platform config files, infrastructure files.

**ORM detection:** Prisma, Drizzle, TypeORM, Sequelize, Mongoose (from `package.json`), Django (from `manage.py`), SQLAlchemy (from requirements), ActiveRecord (from `Gemfile`), EF Core (from `.csproj` content), Hibernate/JPA (from `pom.xml`), GORM (from `go.mod`), Eloquent (from `composer.json`).

### Classification (`src/lib/classification/`)

`classifyRepository(signals)` maps extracted signals to a `RepoClass`:

| RepoClass | Meaning |
|---|---|
| `deployable_web_app` | Next.js or edge-first frontend |
| `static_site` | Static HTML/CSS |
| `service_app` | Backend service (.NET, Express, custom server) |
| `python_service` | Python web service |
| `cloudflare_worker_app` | Wrangler config present |
| `cli_tool` | Go/Rust CLI binary — not a web service |
| `library_or_package` | npm/pip package |
| `notebook_repo` | Jupyter notebooks dominate |
| `infra_only` | Terraform/K8s with no app code |
| `insufficient_evidence` | Not enough signals yet |

CLI tools and non-deployable classes are **hard-capped at 0** on all web platforms.

### Archetypes (`src/lib/archetypes/`)

`matchArchetypes()` matches the repo against known deployment patterns (e.g. `nextjs_standard_app`, `dotnet_service_app`, `express_postgres_service`). Up to 3 archetypes are ranked by confidence and feed directly into platform scoring.

### Scoring (`src/lib/scoring/`)

`scorePlatforms()` runs each platform's rule file against the `ScoringContext` (signals + classification + archetypes + evidence).

Each rule file exports:

```typescript
export const rule: PlatformRule = {
  platform: "Railway",
  score: (ctx) => number,           // 0–100
  reasons: (ctx) => string[],       // why this platform fits
  evidence: (ctx) => string[],      // supporting signals
  disqualifiers: (ctx) => string[]  // reasons it doesn't fit
};
```

Verdict thresholds:

| Score | Verdict |
|---|---|
| 85+ | Excellent fit |
| 70–84 | Good fit |
| 55–69 | Can work |
| 40–54 | Limited fit |
| &lt;40 | Not recommended |

### Plan generation (`src/server/services/analysis-service.ts`)

`createPlanFromSnapshot()` builds the final plan including:

- **Summary** — one-sentence description of the recommendation
- **Blockers / warnings** — from scan findings
- **Next steps** — including ORM-specific migration command (e.g. `prisma migrate deploy`, `rails db:migrate`, `dotnet ef database update`)
- **Env provider suggestions** — clickable provider cards for `DATABASE_URL`, `REDIS_URL`, `S3_*`, `SMTP_*`, `STRIPE_*`
- **Fit type** — `clean`, `multi_service`, or `no_fit`

### AI / Chat (`src/lib/ai/`)

`src/lib/ai/orchestrator.ts` drives the chat interface. It:

1. Resolves the task type from the user message
2. Selects a provider (OpenAI or Anthropic) via `src/lib/ai/registry.ts`
3. Sends the full analysis context (signals, scores, findings, README for no-fit repos) as a system prompt
4. Returns a structured response

Chat messages are **persisted to PostgreSQL** (`ChatMessage` model) so conversations survive page refresh.

## Database schema (key models)

```
Repository
  └── Scan
        ├── ScanFinding
        ├── ScanEvidence
        ├── RepoClassification
        ├── ArchetypeMatch
        └── PlatformScore
              └── DeploymentPlan

Repository
  └── ChatMessage     ← persisted per repo, survives page refresh
```

Feedback and outcome tracking: `RecommendationFeedback`, `OutcomeEvent`.

Algorithm versioning via `RecommendationVersion` (current: `v6-orm-detection`).

## Pages (App Router)

| Route | Purpose |
|---|---|
| `/dashboard` | Repo browser; triggers scans |
| `/chat/[repoId]` | Main workspace: chat, plan, scan summary, env providers |
| `/scan/[repoId]` | Detailed findings and evidence |
| `/comparison/[repoId]` | Featured top card + ranked platform list |

All data-fetching pages are Server Components. Interactivity lives in client components under `src/components/`. The `/chat/[repoId]/loading.tsx` provides an animated loading state during scan generation.
