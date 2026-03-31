# Shipd - Product Requirements Document

v1

## 1. Purpose

Shipd helps AI-first founders and small startup teams decide where and how to deploy a repository before they start changing code or touching infrastructure.

The product reads deployment-relevant repo files, compares hosting options, and generates a deployment plan with blockers, warnings, setup requirements, and tradeoffs.

## 2. Product Goal

Deliver a trustworthy, repo-aware deployment planning experience for modern JavaScript and TypeScript web apps.

## 3. Non-Goals

Shipd v1 will not:

- modify source code
- open PRs
- store secrets
- execute deployments
- replace CI/CD
- act as a general cloud architecture advisor

## 4. Target User

Primary user:

- AI-first founder or small startup team member shipping a web app

Secondary user:

- technical operator or engineer on a small team who needs a fast deployment recommendation and plan

## 5. Supported Repos

In scope:

- Next.js apps
- Node and Express backends
- full-stack JavaScript apps
- Dockerized web apps

Out of scope:

- Kubernetes-first systems
- large polyglot microservice architectures
- mobile apps
- data pipelines

## 6. User Stories

1. As a founder, I want to connect a repo and ask where I should deploy it so I can choose a platform with confidence.
2. As a developer, I want to compare the top platform options so I understand the tradeoffs before committing.
3. As a team member, I want to see blockers and warnings for a chosen platform so I know what must be resolved before launch.
4. As a builder using AI coding tools, I want to export a deployment plan so I can hand it to another tool or teammate.

## 7. Core Features

### 7.1 GitHub Repo Connection

Requirements:

- user can authenticate with GitHub
- user can select a repo from connected repos
- app stores repo metadata and scan history

### 7.2 Repo Scan

Requirements:

- scan deployment-relevant files
- extract framework, runtime, platform signals, environment references, Docker presence, and workflow signals
- produce file-level findings
- persist scan output

Files to inspect initially:

- `package.json`
- `.github/workflows/*`
- `vercel.json`
- `fly.toml`
- `railway.json`
- `Dockerfile`
- `.env.example`
- `README.md`
- `docker-compose.yml`
- `next.config.js`
- `tsconfig.json`

### 7.3 Platform Recommendation

Requirements:

- compare supported platforms for the scanned repo
- rank platforms by fit score
- explain top reasons for each score
- provide confidence level

Initial platform set:

- Vercel
- Railway
- Fly.io
- Render

### 7.4 Platform Comparison View

Requirements:

- show top platform candidates side by side
- include score, verdict, and top tradeoffs
- make the best-fit option visually clear
- keep weaker-fit alternatives visible

### 7.5 Deployment Plan

Requirements:

- generate platform-specific blockers
- generate warnings
- list required environment variables
- list required setup actions
- provide rationale and evidence

### 7.6 Scan Transparency

Requirements:

- show every file scanned
- show extracted signals and findings per file
- make major recommendation logic inspectable

### 7.7 Export

Requirements:

- export Markdown deployment plan
- export JSON deployment data

## 8. UX Requirements

### Landing

- single primary CTA
- no complex navigation
- trust boundary visible above the fold

### Dashboard

- fast repo selection
- clear scan status per repo

### Chat

- primary entry point for recommendation and planning
- support both open-ended and specific-platform prompts
- expose comparison and scan pages contextually

### Comparison

- should feel central, not secondary
- must clearly communicate why one option beats another

### Scan

- must improve trust, not overwhelm users
- default to extracted findings rather than raw file dumps

## 9. Functional Requirements

### FR1

The system must authenticate users with GitHub and retrieve accessible repositories.

### FR2

The system must scan configured deployment-relevant files via read-only GitHub access.

### FR3

The system must generate a normalized scan summary from parsed files.

### FR4

The system must score supported platforms against the scan summary.

### FR5

The system must support both recommendation flow and platform-specific validation flow.

### FR6

The system must generate an exportable deployment plan for a selected platform.

### FR7

The system must display per-file findings and extracted signals in a scan view.

### FR8

The system must preserve a clear read-only boundary in both UI and backend behavior.

## 10. Data Requirements

Store:

- user account and auth metadata
- connected repo metadata
- scan history
- platform scores
- exported plan metadata

Do not store:

- production secrets
- write credentials for user platforms

## 11. Tooling Requirements

### `scan_repo`

- accepts repo URL
- returns structured scan result

### `score_platform`

- accepts platform + scan summary
- returns score, verdict, blockers, warnings, and plan

### `recommend_platform`

- accepts scan summary
- returns ranked platform results

## 12. MCP Requirements

Phase 2 requirements:

- expose scan, recommendation, scoring, and plan generation via MCP
- support use from Codex, Claude Code, Cursor, and similar clients
- keep Shipd planning-only; execution must remain external

## 13. Technical Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Supabase
- Octokit
- Claude API with tool use and streaming

## 14. Success Metrics

Primary metric:

- recommendation acceptance rate

Supporting metrics:

- repo connections per week
- scans completed per week
- comparison page opens per week
- plan exports per week
- time from repo connection to plan export

## 15. Risks

### Risk 1

Users may expect code-fixing or one-click deploy behavior.

Mitigation:

- explicit product messaging
- clear separation between planning and execution

### Risk 2

Scoring may feel arbitrary.

Mitigation:

- expose scan evidence
- explain reasons for recommendation

### Risk 3

Platform vendors may add similar recommendation features.

Mitigation:

- focus on neutrality, comparison quality, and cross-platform trust

## 16. Release Scope

### Must-have

- GitHub auth
- repo selection
- scan
- recommendation
- comparison
- deployment plan
- export

### Nice-to-have

- saved report history
- richer confidence breakdown
- more platforms beyond initial set

### Not in v1

- code edits
- PR generation
- deployment execution
- secret management
- team approvals

## 17. Delivery Plan

### Milestone 1

Foundation:

- app shell
- landing
- dashboard
- mock data flows

### Milestone 2

Intelligence:

- scan engine
- scoring logic
- recommendation flow

### Milestone 3

Trust and output:

- comparison screen
- scan transparency
- export functionality

### Milestone 4

Production readiness:

- auth
- persistence
- streaming
- error handling

## 18. Open Questions

1. Should Render be in the launch set or shortly after?
2. How much traffic or workload inference should come from README analysis versus explicit config signals?
3. How should confidence be represented in the UI: numeric, low/medium/high, or both?
4. Which MCP clients should Shipd support first after launch?
