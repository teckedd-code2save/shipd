# Shipd - Technical Architecture

v1 · March 2026

## 1. Architecture Goals

Shipd should be built to optimize for:

- neutral, repo-aware deployment planning
- strict read-only boundaries
- deterministic product logic
- modular AI orchestration
- multi-provider chat support without product rewrites
- clean expansion to MCP in Phase 2

The most important architectural principle is separation of concerns:

- parsers extract facts
- scorers make decisions
- models explain and synthesize
- UI presents comparison and plans

## 2. Locked Stack

### Frontend and app runtime

- `Next.js` with App Router
- `React`
- `TypeScript`
- `Tailwind CSS`

### Auth

- `Auth.js` with GitHub OAuth

### Data

- `Postgres`
- `Prisma`

### AI orchestration

- `Vercel AI SDK` as the model abstraction layer
- `OpenAI` as the primary provider
- optional `Anthropic` fallback later

### Phase 2

- Shipd MCP server for IDE and agent integrations

## 3. High-Level System Design

```text
┌──────────────────────────────────────────────────────┐
│                     Next.js App                      │
│                                                      │
│  Landing  Dashboard  Chat  Comparison  Scan  Export  │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│                 Application Services                 │
│                                                      │
│  Auth   Repo Access   Scan Service   Plan Service    │
│  Export Service       Chat Service   Report Service  │
└──────────────────────────┬───────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Parsing Layer  │ │ Scoring Layer  │ │ Model Layer    │
│                │ │                │ │                │
│ package.json   │ │ platform rules │ │ provider       │
│ Dockerfile     │ │ confidence     │ │ routing        │
│ workflows      │ │ blockers       │ │ streaming      │
│ env files      │ │ comparisons    │ │ object output  │
└────────────────┘ └────────────────┘ └────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
┌──────────────────────────────────────────────────────┐
│                     Postgres                         │
│ users · repos · scans · scores · plans · exports    │
└──────────────────────────────────────────────────────┘
```

## 4. Provider-Agnostic Chat Architecture

The agent chat should be modular enough that Shipd can:

- switch model providers
- route different tasks to different providers
- add or remove providers without rewriting product logic
- keep the chat UX stable while model infrastructure changes

### Principle

The chat layer must never directly encode vendor-specific logic into UI components or domain services.

Instead, use a dedicated AI orchestration boundary:

```text
UI Chat
  -> Chat Orchestrator
    -> Task Router
      -> Provider Adapter
        -> Model Provider
```

### Recommended chat modules

#### `ChatOrchestrator`

Owns the end-to-end chat request lifecycle:

- receives user message
- resolves repo and session context
- determines task type
- invokes deterministic services first
- calls model layer only where synthesis is needed
- returns streaming UI events

#### `TaskRouter`

Maps requests to task classes, for example:

- `recommend_platforms`
- `score_specific_platform`
- `summarize_scan`
- `answer_follow_up_question`
- `generate_export_summary`

This is where provider choice can vary by workload.

#### `ProviderRegistry`

Registers supported providers:

- `openai`
- `anthropic`
- future providers later

The registry exposes capabilities, cost tier, latency tier, and supported features.

#### `ProviderAdapter`

Every provider implementation must conform to one interface.

Example:

```ts
export interface ModelAdapter {
  name: string;
  supportsStreaming: boolean;
  supportsStructuredOutputs: boolean;
  generateObject<T>(input: ModelObjectRequest<T>): Promise<T>;
  streamText(input: ModelTextRequest): Promise<StreamHandle>;
}
```

#### `PromptBuilder`

Builds model inputs from structured domain data rather than raw ad hoc prompt strings.

This reduces drift and makes output more testable.

#### `ResponseValidator`

Validates model output against schemas before it enters app state or gets exported.

## 5. Recommended Chat Standards

### Standard 1: Deterministic-first orchestration

The chat should not ask a model to decide things that the scoring engine can determine directly.

Correct pattern:

1. scan repo deterministically
2. score platforms deterministically
3. ask model to explain results and answer questions

Wrong pattern:

1. pass raw repo text to model
2. ask model to infer the best platform from scratch

### Standard 2: Structured outputs for all non-trivial responses

Use schema-validated object generation for:

- recommendations
- comparison summaries
- blocker summaries
- plan summaries

Free-form text should only be the rendering layer on top of structured results.

### Standard 3: Streaming text only at the presentation boundary

Domain logic should complete first. Then the explanation layer can stream the user-facing answer.

This prevents partial UI states from becoming the source of truth.

### Standard 4: Capability-aware routing

Different providers may be better at different tasks. The routing layer should choose based on:

- structured output reliability
- latency
- cost
- streaming support

### Standard 5: Provider fallback without behavioral drift

Fallback models should use the same schema and task contracts as the primary provider.

That means:

- same input shape
- same output schema
- same domain-level result contract

The user should not experience a different product because a fallback provider was used.

## 6. Recommended Provider Strategy

### Primary provider

- `OpenAI`

Reason:

- strong structured output support
- strong general reliability for typed product flows
- good fit for decision-support summaries and explanation layers

### Abstraction layer

- `Vercel AI SDK`

Reason:

- provider abstraction
- text streaming
- typed object generation
- tool-friendly architecture

### Secondary provider

- `Anthropic`, later

Reason:

- useful resilience and fallback option
- should be added behind the same adapter contract

### Provider routing policy

Suggested v1 rule set:

- `OpenAI` for structured generation and plan synthesis
- fallback to `Anthropic` only when configured and needed
- never let provider choice leak into UI copy or domain logic

## 7. Domain Logic Standards

### Parsing layer

Create explicit file parsers for:

- `package.json`
- `Dockerfile`
- `.github/workflows/*`
- `.env.example`
- `next.config.*`
- platform config files
- optional `docker-compose.yml`

Each parser should emit typed signals.

Example:

```ts
export interface RepoSignals {
  framework?: "nextjs" | "express" | "react" | "unknown";
  runtime?: "node18" | "node20" | "bun" | "unknown";
  hasDockerfile: boolean;
  hasCustomServer: boolean;
  envVars: string[];
  hasCiWorkflow: boolean;
  detectedPlatformConfigs: string[];
}
```

### Scoring layer

Scores must come from versioned rule sets, not hidden prompt logic.

Each platform should define:

- positive signals
- negative signals
- blocker conditions
- warning conditions
- setup steps
- comparison notes

### Confidence layer

Confidence must be calculated separately from score.

Example:

- score = high because workload fits Railway
- confidence = medium because repo signals are incomplete

This makes the product much more trustworthy.

### Evidence layer

Every recommendation should cite:

- which files were used
- what signals were extracted
- why those signals affect the platform choice

## 8. Data Model

Minimum entities:

- `User`
- `Account`
- `Session`
- `Repository`
- `Scan`
- `ScanFinding`
- `PlatformScore`
- `DeploymentPlan`
- `ExportArtifact`

Suggested schema sketch:

```text
users
accounts
sessions
repositories
scans
scan_findings
platform_scores
deployment_plans
export_artifacts
```

Important constraints:

- no secret values stored
- findings may reference a secret category, but not persist raw secret content
- exports should store metadata and optionally generated content

## 9. Suggested Next.js App Structure

```text
src/
  app/
    (marketing)/
    dashboard/
    chat/[repoId]/
    comparison/[repoId]/
    scan/[repoId]/
    api/
      auth/
      chat/
      repos/
      scans/
      plans/
  components/
    chat/
    comparison/
    scan/
    layout/
    ui/
  lib/
    auth/
    db/
    github/
    ai/
      adapters/
        openai.ts
        anthropic.ts
      registry.ts
      router.ts
      orchestrator.ts
      prompts/
      schemas/
    parsing/
      package-json.ts
      dockerfile.ts
      workflow.ts
      env-file.ts
    scoring/
      engine.ts
      confidence.ts
      rules/
        vercel.ts
        railway.ts
        fly.ts
        render.ts
    plans/
    exports/
  server/
    services/
      scan-service.ts
      recommendation-service.ts
      plan-service.ts
      chat-service.ts
  types/
```

## 10. API Boundaries

Recommended server actions or route handlers:

- `POST /api/repos/connect`
- `POST /api/scans/run`
- `GET /api/scans/:id`
- `POST /api/platforms/recommend`
- `POST /api/platforms/score`
- `POST /api/chat`
- `POST /api/exports/markdown`

Key rule:

- API routes should call domain services
- domain services should not depend on UI concerns

## 11. Security and Trust Standards

### Read-only GitHub access

Use only the permissions required to:

- list repos
- read repo metadata
- read repository contents

### Secret handling

- never display or store full detected secret values
- redact aggressively in UI, logs, and exports
- persist only classification metadata where needed

### Session handling

- use secure Auth.js session configuration
- prefer database-backed sessions for product control and revocation

## 12. Observability and Evaluation

Track:

- recommendation acceptance rate
- comparison view usage
- plan export rate
- time from repo connect to export
- confidence vs user-reported success

Build an eval set of representative repositories:

- clear Vercel-fit repos
- clear Railway-fit repos
- clear Fly-fit repos
- ambiguous repos

For every release, verify:

- recommendation accuracy
- explanation quality
- confidence calibration
- parser regressions

## 13. Build Order

### Phase 1

- Next.js app shell
- Auth.js GitHub auth
- Postgres + Prisma
- repo connection
- deterministic scan engine
- platform scoring engine
- comparison screen
- deployment plan generation
- export

### Phase 2

- provider-agnostic chat orchestration
- second provider adapter
- evaluation harness
- MCP server

### Phase 3

- team workflows
- saved reports and collaboration
- cost and migration analysis

## 14. Recommended Immediate Decisions

These should be locked before implementation:

1. Initial launch platforms:
   - `Railway`, `Fly.io`, `Vercel`, `Render`
2. Confidence display:
   - numeric score plus label
3. Session strategy:
   - database sessions
4. Export order:
   - Markdown first, JSON also supported

## 15. Reference Standards

This architecture aligns with current official platform guidance:

- Next.js App Router:
  [nextjs.org/docs/app](https://nextjs.org/docs/app)
- Auth.js:
  [authjs.dev](https://authjs.dev/)
- OpenAI Structured Outputs:
  [platform.openai.com/docs/guides/structured-outputs](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript)
- Vercel AI SDK:
  [vercel.com/docs/ai-sdk](https://vercel.com/docs/ai-sdk)
- Vercel AI Gateway provider options:
  [vercel.com/docs/ai-gateway/models-and-providers/provider-options](https://vercel.com/docs/ai-gateway/models-and-providers/provider-options)

## 16. Bottom Line

Build Shipd as a deterministic deployment intelligence system with a modular AI presentation layer.

Do not let the chat model become the product logic.

The product logic should stay portable, inspectable, and testable. The model layer should remain replaceable.
