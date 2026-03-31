# Shipd — Agent & Developer Handoff
> Deployment Planner · Chat-first · Repo-connected  
> v0.2 · Extracted from Figma Make · March 2026

---

## 1. What it is

Shipd is a chat-first deployment planning tool. Connect a GitHub repo, describe where you want to deploy (or ask for a recommendation), and Shipd reads your repo's config files to produce a prioritised, step-by-step deployment plan.

**It does not fix code.** It plans deployments. Code fixes stay in Claude / Codex / Cursor. Shipd is what you use before and after them — to know what needs fixing and to confirm you're ready to ship.

**One-liner:** "Point it at your repo. Get a deployment plan."

**Trust boundary:** Read-only GitHub access only. No installs. No code changes. No secrets stored.

**Product wedge:** Shipd is the decision layer before deployment work begins. It helps teams compare realistic hosting options, understand tradeoffs, and leave with a deployable plan they can execute themselves or hand to an AI coding agent.

**Why now:** In an era where coding agents can generate and refactor code quickly, the harder problem is making good deployment decisions with confidence. Shipd should own that decision space, not compete with code-writing agents.

**Follow-on product surface:** Shipd can also exist as an MCP product inside coding environments. In that form, Codex, Claude, Cursor, or other IDE agents can query Shipd for platform recommendations, blockers, required environment variables, and deployment plans, then handle code changes separately. Shipd remains the planning brain; the coding agent remains the execution layer.

### Ideal customer profile

Shipd should target users who can ship product quickly but do not want to become deployment experts:

- solo founders shipping SaaS products
- AI-first indie hackers using coding agents heavily
- small startup teams without dedicated DevOps or platform engineers
- agencies shipping multiple client apps across different hosting stacks

Best-fit repos for v1:

- Next.js products
- Node/Express backends
- full-stack JavaScript apps
- Dockerized web apps

Worst-fit users for v1:

- platform engineering teams already deep in Kubernetes
- enterprises with complex internal cloud governance
- teams looking for a full deployment orchestrator instead of a planning layer

### Market context

The market is crowded with tools that help execute deployments on their own platform, but much thinner on tools that help users decide where and how to deploy across platforms.

That matters more now because:

- AI coding tools make implementation faster, so deployment decisions become the next bottleneck
- more builders can ship apps without deep infrastructure knowledge
- platform choices now carry product, cost, and operational consequences that many early teams do not understand well

Shipd should not compete by being another execution layer. It should compete by being the trusted planning and comparison layer before execution starts.

### Why Shipd wins

If Shipd works, it wins on a different axis from platform vendors and coding agents:

- **Neutral comparison:** not tied to one hosting platform
- **Repo-aware planning:** advice is grounded in actual repo signals, not generic templates
- **Read-only trust:** safe to connect early in the workflow
- **Chat-first interface:** easier for non-experts than digging through docs
- **MCP distribution:** available directly inside coding environments where decisions turn into implementation

This is the core strategic position: Shipd tells you what should happen. Other tools do the changing.

---

## 2. Screens & routes (as built in Figma Make)

| Route | Screen | Purpose |
|-------|--------|---------|
| `/` | Landing | Hero, GitHub connect CTA, social proof |
| `/dashboard` | Repository selector | Pick a connected repo to plan |
| `/chat/:repoId` | Deployment plan chat | Core product — scan + plan + iterate |
| `/comparison` | Platform comparison | Side-by-side platform fit analysis |
| `/scan` | Scan results | Full file-by-file scan breakdown |

---

## 3. Visual design — extracted from your build

### Landing screen (confirmed from screenshot)

- **Background:** Dark navy `#0F1117` with a subtle square grid overlay at low opacity
- **Wordmark:** `Shipd` — large, centered, white, **DM Mono** (monospace bold), ~64px
- **Tagline:** `Point it at your repo. Get a deployment plan.` — muted grey, ~18px Regular
- **CTA:** `Connect GitHub repo →` — full pill shape, **indigo/blue fill** (~`#5B6CF2`), GitHub icon left, white text 15px Medium
- **Trust line:** `Reads your config files. No code changes. No installs.` — very muted, 13px, below CTA
- **Social proof (bottom center):** 5 overlapping avatar circles (blue `JD`, green `SK`, purple `AM`, orange `RL`, teal `TC`) + `127 developers shipped this week`
- **No nav bar** on landing — pure focus on the CTA

### Typography

| Role | Font | Size | Weight | Color |
|------|------|------|--------|-------|
| Wordmark | DM Mono | ~64px | Bold | `#FFFFFF` |
| Tagline | Geist / Inter | ~18px | Regular | `#8B8FA8` |
| CTA button | Geist / Inter | 15px | Medium | `#FFFFFF` |
| Trust line | Geist / Inter | 13px | Regular | `#4B4F66` |
| Social proof | Geist / Inter | 13px | Regular | `#6B6F88` |
| Body / chat | Geist / Inter | 14px | Regular | `#E2E4F0` |
| File paths / code | DM Mono | 12px | Regular | `#A8ABBE` |

### Color tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#0F1117` | Page background |
| `bg-surface` | `#181B24` | Cards, panels |
| `bg-surface-2` | `#1F2330` | Hover, inputs |
| `border` | `#252836` | Dividers, strokes |
| `text-primary` | `#E2E4F0` | Headings, body |
| `text-secondary` | `#8B8FA8` | Subtext |
| `text-muted` | `#4B4F66` | Placeholders |
| `accent-blue` | `#5B6CF2` | CTA, active states |
| `accent-blue-dim` | `#1A1F4A` | Blue badge bg |
| `success` | `#4ADE80` | Done, passing |
| `success-dim` | `#0D2E1A` | Success badge bg |
| `warning` | `#F59E0B` | Warnings |
| `warning-dim` | `#2E1F08` | Warning badge bg |
| `danger` | `#F87171` | Blockers, errors |
| `danger-dim` | `#2E0D0D` | Error badge bg |
| `info` | `#60A5FA` | Scanning state |
| `info-dim` | `#0D1F3A` | Info badge bg |

### Avatar colors (social proof)
```
JD → #5B6CF2  (indigo)
SK → #22C55E  (green)
AM → #A855F7  (purple)
RL → #F97316  (orange)
TC → #14B8A6  (teal)
```

---

## 4. Screen specifications

### Screen 01 — Landing (`/`)

Full viewport, vertically centered content, no nav.

```
┌─────────────────────────────────────────┐
│         [dot/grid bg overlay]           │
│                                         │
│                                         │
│              Shipd                      │  DM Mono Bold ~64px white
│                                         │
│   Point it at your repo.               │  18px grey centered
│   Get a deployment plan.               │
│                                         │
│    [ ⌥  Connect GitHub repo →  ]       │  pill, indigo fill
│                                         │
│  Reads your config files.              │  13px muted
│  No code changes. No installs.         │
│                                         │
│                                         │
│   ●●●●●  127 developers shipped        │  avatar stack + text
│           this week                     │
└─────────────────────────────────────────┘
```

**Exact copy strings:**
- `Shipd`
- `Point it at your repo. Get a deployment plan.`
- `Connect GitHub repo →`
- `Reads your config files. No code changes. No installs.`
- `127 developers shipped this week`

---

### Screen 02 — Dashboard (`/dashboard`)

Nav top + repo card grid.

**Nav:** `Shipd` wordmark left (DM Mono 18px) · user avatar right

**Repo cards:** Grid layout. Per card:
- `org / repo-name` (14px Medium)
- Framework badge pill (e.g. `Next.js`, `Express`)
- Last scanned timestamp or "Not yet scanned"
- `→` arrow to enter chat

**Empty state:** `+ Connect a repo` button centered.

---

### Screen 03 — Deployment Plan Chat (`/chat/:repoId`)

Two-panel layout: left sidebar 320px + right chat area.

**Header bar (56px):**
- Left: `← Dashboard` · `acme-corp / storefront → Railway`
- Right: icon buttons — file (scan), chart (comparison), download (export) — appear contextually
- Platform badge: `Railway · 93%` in success-dim fill, success text

**Left sidebar:**
- Repo name + platform
- Readiness score large (e.g. `68 / 100` in warning color)
- `2 blockers · 3 warnings · 4 optimisations` — 12px muted
- Scrollable step list:
  - `!` red = blocker
  - `~` amber = warning  
  - `n` muted = optimisation/preflight
  - `✓` green = resolved
- Each step clickable — jumps to that message

**Chat area:**
- Agent messages: left-aligned, no bubble, text renders directly, 14px line-height 1.6
- User messages: right-aligned, `bg-surface-2` pill, border, max-width 480px, radius 12px (top-left 4px for chat feel)
- Code blocks: `bg-surface`, border, radius 8px, DM Mono 12px, padding 12px 16px
- Inline code: `bg-surface-2`, radius 3px, DM Mono 12px
- Step cards embedded in agent messages — collapsible

**Step card anatomy:**
```
┌────────────────────────────────────────┐
│ [!] Fix hardcoded secret     [warn]  ↓ │  collapsed, 44px
├────────────────────────────────────────┤
│ Found ENV STRIPE_SECRET_KEY=sk_live_   │  expanded
│ ... on line 14 of Dockerfile. Live     │
│ secrets baked into image layers are    │
│ readable by anyone with image access.  │
│                                        │
│ Required before launch: remove baked   │
│ secret handling and move this value    │
│ to platform-managed environment vars.  │
│                                        │
│ [What to do]  [Why this matters]       │  action buttons
└────────────────────────────────────────┘
```

**Input bar (64px, pinned bottom):**
- `bg-surface`, top border
- Input: `bg-surface-2`, radius 8px, full-width minus send
- Placeholder: `Ask anything about your deployment...`
- Send: 36px circle, `accent-blue`, white arrow

**Two core chat flows:**

**Flow A — Platform recommendation:**
```
User:  Where should I deploy this?

Agent: I've scanned acme-corp/storefront. Here's what I found:
       Framework: Next.js 14 (custom server), Node 20
       Database: DATABASE_URL detected
       Cache: REDIS_URL detected
       
       Best platform options:
       [Railway — 93%  ✦ Best fit]
       [Fly.io   — 78%]
       [Vercel   — 48% — weaker fit for this architecture]
       
       Railway is the best fit for this stack.
       Want me to plan the Railway deployment?
```

**Flow B — Specific platform:**
```
User:  I want to deploy to Vercel.

Agent: Readiness score: 68/100
       2 blockers must be resolved before deploying.
       
       [! Hardcoded secret detected in Dockerfile]
       [! Build workflow requirements unclear]
       [~ Set environment variables in Vercel]
       [~ Node version mismatch]
       [~ No health check after deploy]
       [4 Add dependency caching]
       [5 Link Vercel project]
```

---

### Screen 04 — Platform Comparison (`/comparison`)

Full-width comparison of 5 platforms ranked by fit.

**Columns per platform:** Fit score bar · Pricing · Key features · Pros (green) · Cons (red) · CTA

**Platforms:** Vercel · Fly.io · Railway · Render · Netlify

Top-ranked platform gets `accent-blue` border accent + "Best fit" badge.

---

### Screen 05 — Scan Results (`/scan`)

Flat list grouped by file. Shows every file scanned and all findings.

**Status icons:** `✓` ok (success) · `~` warning (amber) · `!` error (danger) · `⟳` scanning (info)

**File groups:**
1. `package.json` — framework, runtime, scripts, engines field
2. `.github/workflows/*.yml` — CI steps, secrets refs, build presence
3. `vercel.json` / `fly.toml` / `railway.json` — platform config validity
4. `Dockerfile` — base image, exposed ports, ENV secrets
5. `.env.example` — vars referenced vs vars set on platform
6. `README.md` — traffic hints, deploy instructions

---

## 5. Component library

### `<SeverityBadge severity="blocker|warning|optimisation|done|scanning" />`
```
blocker      → danger-dim bg · danger text · "!" 
warning      → warning-dim bg · warning text · "~"
optimisation → bg-surface · text-muted · step number
done         → success-dim bg · success text · "✓"
scanning     → info-dim bg · info text · animated pulse dot
```

### `<PlatformScoreBar score={93} />`
```
Track: bg-surface-2, 4px, full width, radius 2px
Fill:  >80 → success | 50–79 → warning | <50 → danger
Label: score% right of bar, bold, same color
```

### `<StepCard step={step} />`
```
Collapsed (44px): severity dot · title · expand chevron
Expanded:
  reason paragraph (12px text-secondary, line-height 1.6)
  action block (required setup | env table | docs link)
  action buttons (ghost + primary)
```

### `<ScanCard file="" status="" finding="" />`
```
52px · bg-surface · border · radius 8px
Status dot 6px (x:16, y:23), colored by status
File path DM Mono 12px text-primary (x:32, y:10)
Finding 12px Regular status-color (x:32, y:30)
```

### `<PlatformCard platform={} score={} />`
```
bg-surface · border (1.5px accent-blue if top pick)
Name 16px Bold · Verdict badge top-right pill
Score bar 4px · Reason pills 11px · CTA button bottom
```

### `<AvatarStack />`
```
5 × 36px circles, 2px white border, -8px overlap
Initials: DM Mono 13px Bold white
Colors: indigo · green · purple · orange · teal
```

### `<ChatInput />`
```
Container 64px bg-surface top-border
Input: bg-surface-2 radius-8 placeholder text-muted
Send: 36px circle accent-blue white arrow
```

---

## 6. Tech stack (as built)

| Layer | Choice |
|-------|--------|
| Framework | React + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Fonts | DM Mono (wordmark, code) · Geist/Inter (body) |
| State | React useState / useReducer |
| Data | Mock data (prototype — no backend yet) |
| Chat | Simulated streaming with mock responses |
| Export | Client-side Markdown + JSON file download |

**Dev setup:**
```bash
npm install && npm run dev
# → http://localhost:5173
```

**Production backend additions needed:**
- GitHub OAuth (Clerk or NextAuth)
- Claude API with tool use + streaming (Vercel AI SDK)
- Supabase — sessions, scan history, plan storage
- GitHub API (Octokit) — read-only file access
- MCP server surface — expose scan results, platform comparison, and deployment plans to coding environments

---

## 7. Agent tool definitions

### `scan_repo`
```typescript
{
  name: "scan_repo",
  description: "Read deployment-relevant files from a GitHub repo via read-only API.",
  input_schema: {
    type: "object",
    properties: {
      repo_url: { type: "string" },
      files: {
        type: "array",
        items: { type: "string" },
        default: [
          "package.json", ".github/workflows",
          "vercel.json", "fly.toml", "railway.json",
          "Dockerfile", ".env.example", "README.md"
        ]
      }
    },
    required: ["repo_url"]
  }
}
```

**Returns:**
```typescript
interface ScanResult {
  files: Record<string, {
    exists: boolean
    content: string | null
    parsed: Record<string, unknown> | null
    findings: Finding[]
  }>
  summary: {
    framework: string | null
    runtime: string | null
    has_custom_server: boolean
    detected_platform: string | null
    env_vars_referenced: string[]
    has_dockerfile: boolean
    has_ci: boolean
    traffic_hint: string | null
  }
}

interface Finding {
  file: string
  severity: "blocker" | "warning" | "info" | "ok"
  title: string
  detail: string
  next_action?: { type: "setup" | "config" | "docs" | "manual"; content: string }
}
```

### `score_platform`
```typescript
{
  name: "score_platform",
  description: "Score a platform against scan results. Returns 0-100 fit score + ordered deployment plan.",
  input_schema: {
    type: "object",
    properties: {
      platform: {
        type: "string",
        enum: ["vercel","railway","fly","render","netlify",
               "heroku","aws-ecs","aws-lambda","gcp-cloudrun",
               "cloudflare-workers","digitalocean-apps"]
      },
      scan_summary: { type: "object" }
    },
    required: ["platform", "scan_summary"]
  }
}
```

**Returns:** `{ platform, score, verdict, blockers[], warnings[], optimisations[], plan[] }`

### `recommend_platform`
```typescript
// Input: { scan_summary }
// Returns: PlatformScore[] sorted descending by score
```

### MCP surface

Shipd should be able to expose its core capabilities over MCP so coding environments can pull structured deployment guidance directly into the workflow.

Example tools:

- `scan_repo`
- `recommend_platform`
- `score_platform`
- `get_deployment_plan`
- `get_comparison_report`

Example use:

- Codex asks Shipd which platform best fits the current repo
- Shipd returns ranked options, blockers, and platform-side setup requirements
- Codex or Claude then makes any needed code changes in response
- the developer keeps Shipd as the source of deployment truth and the IDE agent as the source of implementation

---

## 8. Platform knowledge base schema

`/lib/platforms/{id}.json`:

```json
{
  "id": "railway",
  "name": "Railway",
  "pricing": "usage-based",
  "free_tier": true,
  "supports": {
    "dockerfile": true,
    "custom_server": true,
    "ssr": true,
    "managed_postgres": true,
    "managed_redis": true
  },
  "runtimes": ["node","python","go","ruby","rust","java","php"],
  "scoring_rules": [
    { "signal": "has_dockerfile",    "delta": +20 },
    { "signal": "has_database_env",  "delta": +15 },
    { "signal": "has_redis_env",     "delta": +10 },
    { "signal": "has_custom_server", "delta": +5  },
    { "signal": "is_static_only",    "delta": -20 }
  ],
  "preflight_steps": [
    { "id": "create-project", "instruction": "Create a Railway project for this repo" },
    { "id": "confirm-runtime", "instruction": "Confirm the detected start command and runtime settings" },
    { "id": "add-postgres", "instruction": "Provision Postgres if the app requires a database", "condition": "has_database_env" },
    { "id": "set-env",      "docs": "https://docs.railway.app/develop/variables" },
    { "id": "first-deploy", "instruction": "Run the first deployment after setup is complete" }
  ]
}
```

---

## 9. File structure

```
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
│   │   ├── chat/
│   │   │   ├── ChatThread.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── AgentMessage.tsx
│   │   │   └── UserMessage.tsx
│   │   ├── plan/
│   │   │   ├── StepCard.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── PlatformScoreBar.tsx
│   │   │   ├── PlatformCard.tsx
│   │   │   └── PlanSidebar.tsx
│   │   ├── repo/
│   │   │   ├── ScanCard.tsx
│   │   │   └── RepoCard.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       ├── CodeBlock.tsx
│   │       ├── Input.tsx
│   │       └── AvatarStack.tsx
│   ├── lib/
│   │   ├── github.ts
│   │   ├── scanner.ts
│   │   ├── scorer.ts
│   │   ├── exporter.ts
│   │   ├── tools.ts
│   │   └── platforms/
│   │       ├── vercel.json
│   │       ├── railway.json
│   │       ├── fly.json
│   │       ├── render.json
│   │       ├── netlify.json
│   │       └── cloudflare-workers.json
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useScan.ts
│   │   └── useExport.ts
│   └── types/
│       ├── scan.ts
│       ├── platform.ts
│       └── plan.ts
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 10. Export functionality

Three contextual icon buttons appear in the chat header:

| Icon | Appears when | Action |
|------|-------------|--------|
| File | Always | → `/scan` full scan results |
| Chart | After recommendation flow | → `/comparison` |
| Download | After plan generated | Markdown or JSON download |

**Markdown export format:**
```markdown
# Shipd Deployment Plan
Repo: acme-corp/storefront · Platform: Railway · Score: 93/100

## Blockers
(none)

## Warnings
- Set environment variables: DATABASE_URL missing from Railway

## Deployment steps
1. Create Railway project
2. Provision Postgres
3. Set required environment variables
4. Confirm runtime and start command
5. Run first deployment
```

---

## 11. Build sequence

| Week | What to build |
|------|--------------|
| 1 | Vite + React Router + Tailwind + fonts · Landing + Dashboard (mock data) |
| 2 | Chat layout + components + mock agent flows · StepCard + sidebar |
| 3 | GitHub OAuth · `scan_repo` tool · Platform JSON files · `score_platform` · Claude API + streaming |
| 4 | Scan results + Comparison screens · Export · Contextual nav icons · Error/loading states |

### Product strategy phases

**Phase 1 — Web product wedge**

- repo connection
- platform comparison
- deployment plan generation
- exportable reports

Goal: become the default decision layer before deployment work begins.

**Phase 2 — MCP distribution**

- Shipd as an MCP server for IDEs and coding agents
- structured planning tools callable from Codex, Claude, Cursor, and similar environments
- deployment plans available inside the coding workflow without turning Shipd into a code-writing product

Goal: meet users inside the environments where implementation work already happens.

**Phase 3 — Team decision workflows**

- shared comparison reports
- collaborative approval flows
- periodic re-scan
- cost estimation and platform-change analysis

Goal: evolve from individual planning utility into team deployment decision infrastructure.

---

## 12. Future additions

- GitLab + Bitbucket — same flow, different OAuth
- Re-scan webhook — triggers on commit push
- Cost estimator — monthly cost per platform given traffic
- Team plans — shared repos, approval workflows
- Shared comparison reports — team decision docs for platform selection
- Platform expansion — deeper support for Render, Netlify, Cloudflare, AWS, GCP
- MCP app for IDEs — Shipd recommendations and deployment plans available directly inside coding agents and dev environments

---

## 13. Design source

| Asset | Detail |
|-------|--------|
| Figma Make file | `Deployment Planning Tool (Copy).make` |
| Published prototype | https://berry-formal-84371299.figma.site/ |
| Canvas size | 1408 × 1244px |
| Background | `#1E1E1E` (canvas) / `#0F1117` (app bg) |
| Built with | Claude Sonnet in Figma Make |

---

*Shipd handoff v0.2 · Extracted from Figma Make · March 2026*
