# Shipd v2 - Deterministic Intelligence and Feedback Spec

v2 draft · April 2026

## 1. Purpose

Shipd v2 should improve four things at once:

- determinism
- accuracy
- user relevance
- shippability of resulting deployment guides

The core rule is simple:

- deterministic systems decide
- AI systems explain
- feedback systems improve future decisions

Shipd should not silently drift based on model behavior. It should learn through explicit evidence, explicit user correction, and offline evaluation.

## 2. Product Goals

Shipd v2 should:

- correctly classify what kind of repo it is looking at
- avoid recommending platforms when evidence is weak
- explain recommendations with file-backed evidence
- generate deployment guides only when confidence is high enough
- collect user feedback in a structured way that improves future results

Shipd v2 should not:

- auto-retrain itself in production
- infer business-critical facts from thin evidence
- fabricate deployment steps for repos that are not yet deployable

## 3. Core Principles

### 3.1 Deterministic first

Every user-visible recommendation must be traceable to extracted repo evidence.

### 3.2 Reject before recommending

The product should first decide whether the repo is deployable enough to classify.

### 3.3 Separate facts, assumptions, and suggestions

Every output should distinguish:

- detected from files
- inferred with low confidence
- suggested next step

### 3.4 Feedback is product data, not just sentiment

The highest-value feedback is:

- what platform the user actually chose
- whether deployment succeeded
- what Shipd got wrong
- what repo type the user says this actually is

### 3.5 Offline learning over live drift

Use feedback to improve extractors, classifiers, archetypes, and templates offline. Release changes deliberately with evaluation.

## 4. v2 Decision Pipeline

```text
Repo ingestion
  -> evidence extraction
  -> repo classification gate
  -> archetype classification
  -> platform compatibility mapping
  -> guide generation
  -> AI explanation layer
  -> user feedback capture
  -> offline evaluation and release
```

## 5. Evidence Extraction

Shipd should maintain a normalized evidence model.

### 5.1 Evidence record

Each extracted signal should be stored as:

```ts
type EvidenceRecord = {
  id: string;
  repoId: string;
  scanId: string;
  kind:
    | "framework"
    | "runtime"
    | "entrypoint"
    | "docker"
    | "workflow"
    | "env_var"
    | "database"
    | "cache"
    | "storage"
    | "orm"
    | "platform_config"
    | "iac"
    | "notebook"
    | "package_type";
  value: string;
  sourceFile: string;
  sourceLine?: number;
  confidence: number;
};
```

### 5.2 Files to inspect

Expand beyond current JavaScript-first scanning.

Core:

- `package.json`
- lockfiles
- `Dockerfile`
- `.dockerignore`
- `.env.example`
- `.env.sample`
- `README.md`
- `.github/workflows/*`
- `docker-compose.yml`
- `docker-compose.yaml`
- `compose.yml`
- `compose.yaml`

JavaScript and TypeScript:

- `next.config.*`
- `vercel.json`
- `fly.toml`
- `railway.json`
- `render.yaml`
- `render.yml`
- `netlify.toml`
- `wrangler.toml`
- `wrangler.json`

Python:

- `pyproject.toml`
- `requirements.txt`
- `Pipfile`
- `setup.py`
- `environment.yml`
- `main.py`
- `app.py`
- `wsgi.py`
- `asgi.py`
- `manage.py`

Infra:

- `infra/**`
- `infrastructure/**`
- `terraform/**`
- `deploy/**`
- `.deploy/**`
- `k8s/**`
- `kubernetes/**`
- `helm/**`
- `*.tf`
- `*.tfvars`
- `Pulumi.yaml`
- `cdk.json`

Negative evidence:

- `*.ipynb`
- package-only repos
- docs-only repos
- infra-only repos

## 6. Repo Classification Gate

Before choosing any platform, Shipd must classify the repo.

### 6.1 Canonical repo classes

```ts
type RepoClass =
  | "deployable_web_app"
  | "static_site"
  | "service_app"
  | "python_service"
  | "cloudflare_worker_app"
  | "library_or_package"
  | "notebook_repo"
  | "infra_only"
  | "insufficient_evidence";
```

### 6.2 Classification rules

Examples:

- notebook repo:
  - `.ipynb` files present
  - no app entrypoint
  - no Dockerfile
  - no platform config
  - no deploy workflow

- library or package:
  - package manifest exists
  - no app server signal
  - no deployment entrypoint
  - no platform config

- infra only:
  - Terraform, Pulumi, or k8s manifests present
  - no runnable app signals

- insufficient evidence:
  - too few deployment-relevant files
  - no confident runtime or entrypoint

### 6.3 User-facing behavior

If repo class is not deployable enough:

- do not force a strong platform recommendation
- do not generate a platform guide
- explain exactly what is missing

## 7. Archetype Classification

Archetypes should be deterministic first.

### 7.1 Initial archetypes

- `nextjs_standard_app`
- `nextjs_custom_server_app`
- `express_postgres_service`
- `dockerized_node_service`
- `python_fastapi_service`
- `python_django_service`
- `python_general_service`
- `static_frontend_site`
- `cloudflare_worker_app`
- `notebook_repo`
- `library_package`
- `infra_only_repo`
- `unknown_low_evidence`

### 7.2 Archetype output

```ts
type ArchetypeMatch = {
  archetype: string;
  confidence: number;
  reasons: string[];
  disqualifiers: string[];
};
```

### 7.3 Standard

Archetype assignment should be explainable through:

- required evidence matched
- optional evidence matched
- conflicting evidence
- missing evidence

## 8. Platform Compatibility Mapping

Once repo class and archetype are known, map to platform fit.

### 8.1 Platform decision object

```ts
type PlatformFit = {
  platform: "Vercel" | "Railway" | "Fly.io" | "Render" | "Cloudflare";
  score: number;
  confidence: number;
  verdict: "strong" | "good" | "viable" | "weak" | "insufficient";
  reasons: string[];
  blockers: string[];
  disqualifiers: string[];
  docsUrl?: string;
};
```

### 8.2 Mapping standards

- score starts low unless evidence is strong
- confidence is independent of score
- disqualifiers should cap score
- weak-evidence repos should never rank highly
- docs links should only appear when repo type and platform fit actually align

## 9. Deployment Guide Generation

Guides should be template-driven and evidence-aware.

### 9.1 Guide gating

Generate a guide only when:

- repo class is deployable
- archetype confidence is above threshold
- selected platform confidence is above threshold

Otherwise generate:

- `Why Shipd cannot produce a reliable deployment guide yet`
- `What Shipd still needs`

### 9.2 Guide structure

- why this platform
- what Shipd detected
- required setup
- required environment variables
- build and runtime expectations
- platform-side setup steps
- open questions
- risks and assumptions

### 9.3 Guide generation rules

- only include file-backed facts or clearly marked assumptions
- never invent env vars not detected or platform-required
- never invent commands if runtime/entrypoint is unclear
- clearly distinguish:
  - detected
  - assumed
  - user must confirm

## 10. Feedback Architecture

Feedback should directly improve relevance.

### 10.1 User feedback types

Shipd should support:

- thumbs up or down
- recommendation correctness
- chosen platform
- deploy success or failure
- wrong repo type correction
- wrong framework/runtime correction
- blocker false positive
- blocker omission
- guide completeness feedback
- free-text notes

### 10.2 Canonical feedback objects

```ts
type RecommendationFeedback = {
  id: string;
  repoId: string;
  scanId: string;
  recommendationVersion: string;
  recommendedPlatform: string | null;
  chosenPlatform?: string | null;
  wasRecommendationCorrect?: boolean | null;
  deploySucceeded?: boolean | null;
  correctionType?:
    | "wrong_repo_class"
    | "wrong_framework"
    | "wrong_platform"
    | "false_blocker"
    | "missing_blocker"
    | "guide_incomplete"
    | "other";
  correctedRepoClass?: string | null;
  note?: string | null;
  createdAt: string;
};
```

```ts
type OutcomeEvent = {
  id: string;
  repoId: string;
  scanId: string;
  action:
    | "opened_plan"
    | "opened_comparison"
    | "opened_scan"
    | "exported_plan"
    | "selected_platform"
    | "marked_correct"
    | "marked_incorrect"
    | "reported_success"
    | "reported_failure";
  platform?: string | null;
  metadata?: Record<string, string>;
  createdAt: string;
};
```

### 10.3 Highest-value feedback signals

Most useful:

- user-chosen platform
- deploy success or failure
- corrected repo class
- false blocker report
- missing blocker report

Less useful:

- generic thumbs up or down without explanation
- vague complaint text without structured correction

## 11. Continuous Learning Loop

Learning should be explicit and release-driven.

### 11.1 Loop

1. Collect scan snapshots
2. Collect user feedback and outcomes
3. Group failures by pattern
4. Update deterministic extractors and repo-class rules
5. Update archetypes and platform mappings
6. Re-run benchmark evaluation
7. Release new version

### 11.2 What should improve first

- empty repo handling
- notebook repo handling
- Python repo handling
- stale recommendation mismatch
- missing blocker precision
- docs-link relevance

### 11.3 What should not auto-learn

- platform weights in production without evaluation
- user free text directly modifying rules
- LLM answers becoming source of truth

## 12. Product UX for Relevance

Feedback should be native to the workflow.

### 12.1 On recommendation view

Show:

- `Was this recommendation right?`
- `What did you actually deploy to?`
- `What did Shipd get wrong?`

### 12.2 On scan view

Show:

- `Mark this as false positive`
- `Shipd missed something`

### 12.3 On repo workspace

Show:

- repo class
- archetype
- confidence
- detected facts
- open questions

### 12.4 For weak evidence repos

Show:

- `Not enough deployment evidence`
- `Why`
- `What to add or confirm`

This increases trust and reduces fake precision.

## 13. Data Model Changes

Shipd v2 should add tables or models for:

- `ScanEvidence`
- `RepoClassification`
- `ArchetypeMatch`
- `RecommendationFeedback`
- `OutcomeEvent`
- `RecommendationVersion`

### 13.1 Recommendation versioning

Every recommendation should store:

- extractor version
- classifier version
- archetype version
- mapping version
- guide template version
- AI explanation version

Without this, feedback cannot be evaluated properly.

## 14. Evaluation Framework

Shipd v2 should ship with a benchmark repo suite.

### 14.1 Required benchmark classes

- empty repo
- docs-only repo
- notebook-only repo
- library/package repo
- static frontend
- standard Next.js app
- custom-server Next.js app
- Dockerized Node service
- Python FastAPI app
- Python Django app
- infra-only repo
- Cloudflare Worker repo

### 14.2 Metrics

- repo class accuracy
- archetype accuracy
- top-1 platform agreement
- false positive blocker rate
- missing blocker rate
- recommendation acceptance rate
- recommendation override rate
- deploy success correlation

### 14.3 Release gates

Do not release a new logic version unless:

- empty and notebook repos correctly reject recommendation
- repo-class accuracy improves or holds
- false positive rate does not regress
- top recommendation agreement improves on benchmark repos

## 15. v2 Implementation Order

### Phase 1

- expand deterministic extraction
- add repo classification gate
- remove all forced high-confidence recommendations for weak repos

### Phase 2

- introduce archetype classification
- update platform compatibility mapping
- add guide gating and weak-evidence guide states

### Phase 3

- add feedback capture UI
- add outcome tracking
- add benchmark repo suite and release reporting

### Phase 4

- introduce optional embedding search for archetype retrieval only if deterministic archetypes hit coverage limits

## 16. Decision Summary

Shipd v2 should be:

- deterministic before generative
- classification-first before recommendation-first
- evidence-backed before confidence-heavy
- feedback-driven before self-adapting

The right Shipd learning system is:

- explicit user correction
- explicit deployment outcomes
- offline evaluation
- deliberate release

Not:

- silent production drift
- opaque vector decisions without rejection logic
