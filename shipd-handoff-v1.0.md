# Shipd - Final Product Handoff Document

v1.0 · Deployment Decision Layer · March 2026

## 1. Product Thesis

Shipd is the deployment decision layer for the AI-assisted era.

While coding agents like Claude, Codex, and Cursor generate code and platforms like Railway, Fly.io, and Vercel execute deployments, Shipd owns the critical middle ground: determining where and how to deploy based on actual repo analysis.

**One-liner:** "Point it at your repo. Compare your options. Deploy with confidence."

**Core conviction:** Platform-native AI tools optimize for execution speed. Shipd optimizes for decision quality. That neutrality is difficult for any platform vendor to match credibly.

## 2. Ideal Customer Profile

Shipd v1 should focus on:

- AI-first founders shipping SaaS products
- small startup teams without dedicated DevOps or platform engineers
- teams deploying modern JavaScript and TypeScript web apps

Best-fit repos for v1:

- Next.js apps
- Node and Express backends
- full-stack JavaScript apps
- Dockerized web apps

Out of scope for the first wedge:

- Kubernetes-heavy platform teams
- large enterprises with strict internal cloud governance
- teams looking for a full deployment orchestrator instead of a planning layer

## 3. Strategic Positioning

### Why Shipd Wins

| Moat | Platform-Native Tools | Shipd |
|------|------------------------|-------|
| Neutrality | Incentivized toward their own platform | No horse in the race; evaluates multiple platforms |
| Comparative intelligence | Single-platform deep | Cross-platform comparison with tradeoff analysis |
| Ground truth | Heuristics and platform assumptions | Actual file parsing of `Dockerfile`, `package.json`, workflows, env references |

### Competitive Response Matrix

| Threat | Shipd Response |
|--------|----------------|
| Railway MCP becomes default | Become the second-opinion planning layer before execution |
| Fly.io markets itself as the AI-preferred option | Counter with repo-specific fit, not popularity claims |
| Vercel expands from runtime into planning | Own the non-Vercel decision layer, especially for Express, Docker, and mixed workloads |
| Platforms build comparison tools | Compete on neutrality and cross-platform trust, where vendor incentives are weaker |

## 4. User Flows

### Flow A: Platform Recommendation

```text
User: "Where should I deploy this?"

Shipd: [scan_repo] ->
       Framework: Next.js 14 (custom server), Node 20
       Database: DATABASE_URL detected
       Cache: REDIS_URL detected

       Best platform options:
       Railway - 93%  Best fit
       - Docker-native, managed Postgres/Redis
       - Custom server support

       Fly.io - 78%
       - Good fit, requires more manual scaling setup

       Vercel - 48% - weaker fit
       - Custom server limits, no native Redis

       Want me to plan the Railway deployment?
```

### Flow B: Specific Platform Validation

```text
User: "I want to deploy to Vercel."

Shipd: Readiness score: 68/100
       2 blockers must be resolved before deploying.

       [!] Hardcoded secret detected in Dockerfile
       [!] Build workflow requirements unclear
       [~] Set environment variables in Vercel
       [~] Node version mismatch (18 vs 20)

       [View blockers] [Compare alternatives]
```

### Flow C: MCP Gateway

```text
Cursor/Claude -> Shipd MCP: plan_deployment
Shipd -> Returns: scored options + blockers + tradeoffs
User -> Selects platform with full context
Cursor/Claude -> Platform MCP: execute_deployment
```

Shipd remains the planning prerequisite, not the execution layer.

## 5. Screen Specifications

### Screen 01 - Landing (`/`)

Purpose: Pure conversion. No nav, no distractions.

```text
┌─────────────────────────────────────────┐
│         [subtle grid overlay #0F1117]   │
│                                         │
│                                         │
│              Shipd                      │
│                                         │
│   Point it at your repo.               │
│   Get a deployment plan.               │
│                                         │
│    [ Connect GitHub repo -> ]          │
│                                         │
│  Reads your config files.              │
│  No code changes. No installs.         │
│                                         │
│                                         │
│   ●●●●●  127 developers shipped        │
│           this week                     │
└─────────────────────────────────────────┘
```

Avatar colors:

- `JD` `#5B6CF2`
- `SK` `#22C55E`
- `AM` `#A855F7`
- `RL` `#F97316`
- `TC` `#14B8A6`

Exact copy:

- `Shipd`
- `Point it at your repo. Get a deployment plan.`
- `Connect GitHub repo ->`
- `Reads your config files. No code changes. No installs.`
- `127 developers shipped this week`

### Screen 02 - Dashboard (`/dashboard`)

Nav:

- `Shipd` wordmark left
- user avatar right

Repo cards:

- `org / repo-name`
- framework badge pill
- last scanned timestamp
- arrow to enter chat

Empty state:

- `+ Connect a repo`

### Screen 03 - Deployment Plan Chat (`/chat/:repoId`)

Layout:

- left sidebar `320px`
- right chat area fluid

Header:

- left: `← Dashboard · acme-corp / storefront → Railway`
- right: file, chart, download icons
- platform badge: `Railway · 93%`

Left sidebar:

```text
┌────────────────────┐
│ acme-corp/         │
│ storefront         │
│ → Railway          │
│                    │
│     68 / 100       │
│                    │
│ 2 blockers · 3     │
│ warnings · 4 opts  │
│                    │
│ ─────────────────  │
│                    │
│ [!] Hardcoded      │
│     secret         │
│                    │
│ [~] Set env vars   │
│                    │
│ [3] Add caching    │
│                    │
│ [✓] Runtime OK     │
└────────────────────┘
```

Chat area:

- agent messages: left-aligned, no bubble
- user messages: right-aligned pill
- code blocks: surface background, bordered, DM Mono
- inline code: darker inline surface

Step card:

```text
┌────────────────────────────────────────┐
│ [!] Hardcoded secret detected  [warn] ↓│
├────────────────────────────────────────┤
│ Found a secret-like value in the       │
│ Dockerfile on line 14. Secrets baked   │
│ into image layers may be readable by   │
│ anyone with image access.              │
│                                        │
│ Required before launch: remove baked   │
│ secret handling and move this value    │
│ to platform-managed environment vars.  │
│                                        │
│ [What to do]  [Why this matters]       │
└────────────────────────────────────────┘
```

Input bar:

- pinned bottom
- placeholder: `Ask anything about your deployment...`
- send button: blue circular action

### Screen 04 - Platform Comparison (`/comparison/:repoId`)

Purpose: side-by-side neutral comparison.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         Platform Comparison                             │
│                                                                         │
│  Railway   ★ 93%   | Best fit | Docker | Managed Postgres | Custom srv  │
│  Fly.io      78%   | Good fit | Docker | Manual scaling                  │
│  Vercel      48%   | Weak fit | Edge    | Serverless-first               │
│  Render      72%   | Good fit | Docker  | Auto deploy                    │
│                                                                         │
│  Legend: ★ = Best fit for this repo | Score based on detected signals    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Screen 05 - Scan Results (`/scan/:repoId`)

Purpose: full transparency. Every file analyzed, every finding documented.

```text
┌─────────────────────────────────────────┐
│ Scan Results: acme-corp/storefront      │
│                                         │
│ package.json                    [✓]     │
│   Framework: Next.js 14.2.0             │
│   Runtime: Node 20.11.0                 │
│   Engine field: OK                      │
│                                         │
│ .github/workflows/ci.yml        [~]     │
│   Warning: No build step detected       │
│   Action: Review workflow requirements  │
│                                         │
│ Dockerfile                      [!]     │
│   Blocker: Secret-like value on L14     │
│   Action: Move to platform env vars     │
│                                         │
│ vercel.json                     [✓]     │
│   Not present (optional)                │
│                                         │
│ .env.example                    [~]     │
│   DATABASE_URL present                  │
│   Warning: Add placeholder value        │
│                                         │
│ README.md                       [✓]     │
│   Deployment instructions found         │
└─────────────────────────────────────────┘
```

Status legend:

- `✓` OK
- `~` Warning
- `!` Blocker
- `⟳` Scanning

## 6. Design System

### Color Tokens

| Token | Hex | Usage |
|------|-----|-------|
| `bg-base` | `#0F1117` | Page background |
| `bg-surface` | `#181B24` | Cards, panels |
| `bg-surface-2` | `#1F2330` | Hover, inputs, user messages |
| `border` | `#252836` | Dividers, strokes |
| `text-primary` | `#E2E4F0` | Headings, body |
| `text-secondary` | `#8B8FA8` | Subtext |
| `text-muted` | `#4B4F66` | Placeholders, timestamps |
| `accent-blue` | `#5B6CF2` | CTA, active states, best fit |
| `accent-blue-dim` | `#1A1F4A` | Blue badge background |
| `success` | `#4ADE80` | Done, passing, high scores |
| `success-dim` | `#0D2E1A` | Success badge background |
| `warning` | `#F59E0B` | Warnings, medium scores |
| `warning-dim` | `#2E1F08` | Warning badge background |
| `danger` | `#F87171` | Blockers, errors, low scores |
| `danger-dim` | `#2E0D0D` | Error badge background |
| `info` | `#60A5FA` | Scanning state |
| `info-dim` | `#0D1F3A` | Info badge background |

### Typography

| Role | Font | Size | Weight | Color |
|------|------|------|--------|-------|
| Wordmark | DM Mono | 64px | Bold | `#FFFFFF` |
| Tagline | Geist/Inter | 18px | Regular | `#8B8FA8` |
| CTA Button | Geist/Inter | 15px | Medium | `#FFFFFF` |
| Trust Line | Geist/Inter | 13px | Regular | `#4B4F66` |
| Social Proof | Geist/Inter | 13px | Regular | `#6B6F88` |
| Body/Chat | Geist/Inter | 14px | Regular | `#E2E4F0` |
| File Paths | DM Mono | 12px | Regular | `#A8ABBE` |
| Code | DM Mono | 12px | Regular | `#E2E4F0` |
| Badges | Geist/Inter | 11px | Medium | varies |

### Component Library

#### `<SeverityBadge />`

```ts
type Severity = "blocker" | "warning" | "optimisation" | "done" | "scanning";
```

- blocker: danger-dim bg, danger text, `!`
- warning: warning-dim bg, warning text, `~`
- optimisation: bg-surface, text-muted, step number
- done: success-dim bg, success text, `✓`
- scanning: info-dim bg, info text, animated pulse

#### `<PlatformScoreBar score={93} />`

- track: `bg-surface-2`, `4px` height
- fill: `>80 success | 50-79 warning | <50 danger`
- label: score percentage in fill color

#### `<StepCard step={step} />`

- collapsed: `44px`, severity dot + title + chevron
- expanded: reason paragraph + action block + buttons

#### `<ChatInput />`

- container: `64px`, `bg-surface`, top border
- input: `bg-surface-2`, radius `8px`
- send: `36px` circle, accent blue

## 7. Technical Architecture

### Stack

| Layer | Choice |
|------|--------|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Fonts | DM Mono and Geist/Inter |
| State | React `useState` / `useReducer` + Context |
| Data | Supabase |
| AI | Claude API with tool use + streaming |
| GitHub | Octokit read-only |
| MCP | Custom server in Phase 2 |

### File Structure

```text
shipd/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Chat.tsx
│   │   ├── Comparison.tsx
│   │   └── ScanResults.tsx
│   ├── components/
│   ├── lib/
│   │   ├── github.ts
│   │   ├── scanner.ts
│   │   ├── scorer.ts
│   │   ├── exporter.ts
│   │   ├── tools.ts
│   │   └── platforms/
│   ├── hooks/
│   └── types/
├── mcp-server/
│   ├── index.ts
│   ├── tools/
│   │   ├── scanRepo.ts
│   │   ├── recommendPlatform.ts
│   │   ├── scorePlatform.ts
│   │   └── getDeploymentPlan.ts
│   └── README.md
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

## 8. Agent Tool Definitions

### `scan_repo`

```ts
{
  name: "scan_repo",
  description: "Read deployment-relevant files from a GitHub repo via read-only API. Returns structured analysis of framework, runtime, dependencies, and potential blockers.",
  input_schema: {
    type: "object",
    properties: {
      repo_url: {
        type: "string",
        description: "Full GitHub URL"
      },
      files: {
        type: "array",
        items: { type: "string" },
        default: [
          "package.json",
          ".github/workflows",
          "vercel.json",
          "fly.toml",
          "railway.json",
          "Dockerfile",
          ".env.example",
          "README.md",
          "docker-compose.yml",
          "next.config.js",
          "tsconfig.json"
        ]
      }
    },
    required: ["repo_url"]
  }
}
```

Returns: `ScanResult`

```ts
interface ScanResult {
  files: Record<string, {
    exists: boolean;
    content: string | null;
    parsed: Record<string, unknown> | null;
    findings: Finding[];
  }>;
  summary: {
    framework: string | null;
    runtime: string | null;
    has_custom_server: boolean;
    detected_platform: string | null;
    env_vars_referenced: string[];
    has_dockerfile: boolean;
    has_ci: boolean;
    traffic_hint: string | null;
  };
}

interface Finding {
  file: string;
  severity: "blocker" | "warning" | "info" | "ok";
  title: string;
  detail: string;
  line_number?: number;
  next_action?: {
    type: "setup" | "config" | "docs" | "manual";
    content: string;
    url?: string;
  };
}
```

### `score_platform`

```ts
{
  name: "score_platform",
  description: "Score a specific platform against scan results. Returns 0-100 fit score with blockers, warnings, and a deployment plan.",
  input_schema: {
    type: "object",
    properties: {
      platform: {
        type: "string",
        enum: [
          "vercel", "railway", "fly", "render", "netlify",
          "heroku", "aws-ecs", "aws-lambda", "gcp-cloudrun",
          "cloudflare-workers", "digitalocean-apps"
        ]
      },
      scan_summary: {
        type: "object"
      }
    },
    required: ["platform", "scan_summary"]
  }
}
```

Returns: `PlatformScore`

```ts
interface PlatformScore {
  platform: string;
  score: number;
  verdict: "perfect" | "good" | "viable" | "weak" | "poor";
  confidence: number;

  blockers: Step[];
  warnings: Step[];
  optimisations: Step[];

  plan: Step[];
  alternatives: string[];
}

interface Step {
  id: string;
  title: string;
  description: string;
  severity: "blocker" | "warning" | "optimisation";
  category: "config" | "env" | "build" | "deploy" | "monitor";
  estimated_time?: string;
  action?: {
    type: "url" | "docs" | "manual";
    value: string;
  };
}
```

### `recommend_platform`

```ts
{
  name: "recommend_platform",
  description: "Compare supported platforms and return ranked recommendations based on repo analysis.",
  input_schema: {
    type: "object",
    properties: {
      scan_summary: { type: "object" }
    },
    required: ["scan_summary"]
  }
}
```

Returns: `PlatformScore[]`

## 9. Platform Knowledge Base Schema

Path: `/lib/platforms/{id}.json`

```json
{
  "id": "railway",
  "name": "Railway",
  "tagline": "Infrastructure from the future",
  "pricing": {
    "model": "usage-based",
    "free_tier": true,
    "estimate_url": "https://railway.app/pricing"
  },
  "supports": {
    "dockerfile": true,
    "custom_server": true,
    "ssr": true,
    "static_sites": false,
    "managed_postgres": true,
    "managed_redis": true,
    "managed_mysql": false,
    "auto_scaling": true,
    "custom_domains": true,
    "preview_deployments": true
  },
  "runtimes": ["node", "python", "go", "ruby", "rust", "java", "php", "docker"],
  "scoring_rules": [
    { "signal": "has_dockerfile", "weight": 20, "reason": "Native Docker support" },
    { "signal": "has_database_env", "weight": 15, "reason": "Managed Postgres" },
    { "signal": "has_redis_env", "weight": 10, "reason": "Managed Redis" },
    { "signal": "has_custom_server", "weight": 10, "reason": "Custom server support" },
    { "signal": "is_nextjs", "weight": 5, "reason": "Good Next.js support" },
    { "signal": "is_static_only", "weight": -20, "reason": "Overkill for static sites" },
    { "signal": "requires_edge_functions", "weight": -10, "reason": "Limited edge runtime" }
  ],
  "blocker_conditions": [
    {
      "condition": "is_static_only && !has_dockerfile",
      "message": "Railway is overkill for static sites. Consider Vercel or Netlify."
    }
  ],
  "preflight_steps": [
    {
      "id": "create-project",
      "instruction": "Create a Railway project",
      "url": "https://railway.app/new"
    },
    {
      "id": "confirm-runtime",
      "instruction": "Confirm detected start command",
      "condition": "has_package_json"
    },
    {
      "id": "add-postgres",
      "instruction": "Provision Postgres",
      "condition": "has_database_env",
      "url": "https://docs.railway.app/databases/postgresql"
    },
    {
      "id": "add-redis",
      "instruction": "Provision Redis",
      "condition": "has_redis_env",
      "url": "https://docs.railway.app/databases/redis"
    },
    {
      "id": "set-env",
      "instruction": "Set environment variables",
      "url": "https://docs.railway.app/develop/variables"
    },
    {
      "id": "first-deploy",
      "instruction": "Trigger first deployment"
    }
  ]
}
```

## 10. MCP Server Specification

Shipd exposes its planning intelligence through MCP for coding environments.

### Available Tools

| Tool | Description | Returns |
|------|-------------|---------|
| `shipd_scan_repo` | Analyze repo structure and signals | `ScanResult` |
| `shipd_recommend_platform` | Rank platforms by fit | `PlatformScore[]` |
| `shipd_score_platform` | Deep score a specific platform | `PlatformScore` |
| `shipd_get_deployment_plan` | Generate step-by-step plan | `Step[]` |
| `shipd_compare_platforms` | Side-by-side comparison | `ComparisonResult` |

### Integration Pattern

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Cursor /    │────→│ Shipd MCP   │────→│ Shipd Engine │
│ Claude /    │     │ (gateway)   │     │             │
│ Codex       │←────│             │←────│             │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ↓
                    ┌─────────────┐
                    │ Platform    │
                    │ MCPs        │
                    │ (Railway,   │
                    │ Fly, etc.)  │
                    └─────────────┘
```

Key insight: Shipd MCP answers "what should I do and why?" before platform MCPs answer "how do I execute?"

## 11. Export Functionality

### Contextual Header Icons

| Icon | Appears | Action |
|------|---------|--------|
| File | Always | Navigate to `/scan/:repoId` |
| Chart | After recommendation | Navigate to `/comparison/:repoId` |
| Download | After plan generated | Export Markdown or JSON |

### Markdown Export Format

```md
# Shipd Deployment Plan

**Repo:** acme-corp/storefront
**Platform:** Railway
**Score:** 93/100 (Perfect fit)
**Generated:** 2026-03-30T16:50:00Z

---

## Executive Summary

Railway is an excellent fit for this Next.js application with custom server
requirements. Managed Postgres and Redis align with detected environment
variables.

## Blockers
(none)

## Warnings
- [ ] Set `DATABASE_URL` in Railway dashboard

## Deployment Steps

### 1. Create Railway Project
- URL: https://railway.app/new
- Connect GitHub repo: `acme-corp/storefront`

### 2. Provision Postgres
- Detected `DATABASE_URL` in `.env.example`

### 3. Provision Redis (Optional)
- Detected `REDIS_URL` in `.env.example`

### 4. Configure Environment
Required variables:
- `DATABASE_URL`
- `REDIS_URL`
- `NEXTAUTH_SECRET`

### 5. Deploy
- Start command: `npm start`
- First deploy triggers on push to `main`

## Why Not Alternatives

**Fly.io (78%):** Good fit, requires more manual scaling configuration.

**Vercel (48%):** Custom server limits and no native Redis make this a weak fit.
```

## 12. Build Sequence

### Week 1: Foundation

- [ ] Vite + React + Tailwind setup
- [ ] DM Mono + Geist font loading
- [ ] color token system
- [ ] landing page
- [ ] dashboard layout + repo cards

### Week 2: Core Chat Experience

- [ ] chat layout
- [ ] message components
- [ ] `StepCard`
- [ ] `ChatInput`
- [ ] mock agent flows
- [ ] simulated streaming

### Week 3: Intelligence Layer

- [ ] GitHub OAuth
- [ ] `scan_repo`
- [ ] platform JSON files
- [ ] `score_platform`
- [ ] `recommend_platform`
- [ ] Claude API integration
- [ ] real streaming responses

### Week 4: Polish and Expansion

- [ ] comparison screen
- [ ] scan results screen
- [ ] export functionality
- [ ] contextual nav icons
- [ ] error states and loading skeletons
- [ ] responsive adjustments
- [ ] MCP scaffolding

## 13. Success Metrics

### North Star

Recommendation acceptance rate: the percentage of users who choose one of Shipd's top recommended platforms after comparison.

### Leading Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Repo connections | 100/week | GitHub OAuth events |
| Scans completed | 300/week | `scan_repo` invocations |
| Platform comparisons opened | 100/week | visits to `/comparison/:repoId` |
| Plan exports | 50/week | download clicks |
| MCP installs (Phase 2) | 50/week | MCP server installs |

### Lagging Indicators

- user-reported deployment success rate
- time from repo connection to successful deploy
- percentage of users who switch platform after comparison

## 14. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Railway MCP becomes default | Position as the second-opinion layer and emphasize comparison |
| Claude API costs or limits | Cache scan results and support fallback rule-based scoring |
| Platform API changes | Version platform schemas and validate them automatically |
| User expects code fixes | Clear messaging: Shipd plans, your AI codes |
| Low differentiation from native tools | Double down on comparison UI and cross-platform trust |

## 15. Future Roadmap

### Phase 2: MCP Distribution

- Shipd MCP server launch
- Cursor marketplace listing
- Claude Code plugin
- "Plan in Shipd, execute in platform" workflow

### Phase 3: Team Infrastructure

- shared comparison reports
- team approval workflows
- cost estimation based on traffic
- periodic re-scan and change detection

### Phase 4: Platform Expansion

- AWS, GCP, and Azure support
- Kubernetes scoring for EKS and GKE
- enterprise compliance scanning
- custom platform scoring rules

## 16. Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-30 | Neutral positioning over "best tool" | More defensible against platform-native tools |
| 2026-03-30 | MCP gateway pattern | Lets Shipd coexist with platform MCPs rather than compete directly |
| 2026-03-30 | Ground truth over training data | Repo parsing beats LLM heuristics for specific fit |
| 2026-03-30 | Comparison UI as core feature | Hard for vendors to do credibly without platform bias |
| 2026-03-30 | No code fixes, only planning | Maintains boundary with coding agents and avoids scope creep |

## 17. Resources

| Resource | Location |
|----------|----------|
| Figma prototype | https://berry-formal-84371299.figma.site/ |
| Design source | `Deployment Planning Tool (Copy).make` |
| Dev server | `npm install && npm run dev` -> `http://localhost:5173` |
| Repo | `github.com/shipd/shipd` |

---

Shipd v1.0 - March 2026

The deployment decision layer for the AI-assisted era. Neutral by design. Grounded in code. Hard for platforms to replicate credibly.
