# Shipd v2 - Implementation Checklist

v2 draft · April 2026

This checklist maps the v2 plan directly to the current Shipd codebase.

## 1. Phase 1 - Deterministic Repo Understanding

### 1.1 Expand evidence extraction

Files to update:

- [scan-repository.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/parsing/scan-repository.ts)
- [types.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/parsing/types.ts)
- [shared.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/parsing/shared.ts)
- [github-scan-source.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/server/services/github-scan-source.ts)

Tasks:

- add `EvidenceRecord` output structure
- expand Python app detection
- add package/library detection
- add static-site detection
- add Cloudflare/Wrangler detection
- add app-entrypoint detection
- add negative evidence for notebooks and docs-only repos

### 1.2 Add explicit repo classification gate

New files:

- `src/lib/classification/classify-repository.ts`
- `src/lib/classification/types.ts`

Likely callers:

- [analysis-service.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/server/services/analysis-service.ts)

Tasks:

- classify repo before platform scoring
- return `repoClass`, `confidence`, `reasons`, `blockers`
- support `insufficient_evidence`
- support `notebook_repo`
- support `library_or_package`
- support `infra_only`

### 1.3 Stop recommending when evidence is weak

Files to update:

- [rules.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/scoring/rules.ts)
- [analysis-service.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/server/services/analysis-service.ts)

Tasks:

- add score caps for weak evidence
- add explicit `insufficient` verdict
- change plan summary for weak repos
- stop rendering strong provider docs links for weak repos

## 2. Phase 2 - Archetype Layer

### 2.1 Add deterministic archetype classifier

New files:

- `src/lib/archetypes/types.ts`
- `src/lib/archetypes/match-archetypes.ts`
- `src/lib/archetypes/catalog.ts`

Tasks:

- define first 10-15 archetypes
- produce ranked archetype matches
- separate reasons from disqualifiers
- add fallback `unknown_low_evidence`

### 2.2 Feed archetypes into scoring

Files to update:

- [engine.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/scoring/engine.ts)
- [types.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/scoring/types.ts)
- provider rule files in [rules](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/scoring/rules)

Tasks:

- score from repo class + archetype + evidence
- reduce direct dependence on loose booleans
- keep provider rules explainable

## 3. Phase 3 - Persistence and Versioning

### 3.1 Extend Prisma schema

Files to update:

- [schema.prisma](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/prisma/schema.prisma)

Tasks:

- add `RecommendationVersion`
- add `ScanEvidence`
- add `RepoClassification`
- add `ArchetypeMatch`
- add `RecommendationFeedback`
- add `OutcomeEvent`

### 3.2 Create migration flow

Tasks:

- add Prisma migration
- seed active recommendation version
- attach version id to new scans

### 3.3 Persist v2 analysis objects

Files to update:

- [analysis-service.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/server/services/analysis-service.ts)

Tasks:

- persist normalized evidence
- persist repo classification
- persist archetype matches
- persist version id
- keep current snapshot JSON for compatibility

## 4. Phase 4 - UX for Trust and Relevance

### 4.1 Show repo type before platform choice

Files to update:

- [page.tsx](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/app/chat/[repoId]/page.tsx)
- [page.tsx](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/app/comparison/[repoId]/page.tsx)
- [page.tsx](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/app/scan/[repoId]/page.tsx)

Tasks:

- display repo class
- display archetype
- display confidence
- separate detected facts from assumptions

### 4.2 Add insufficient evidence UI

Files to update:

- [chat-workspace.tsx](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/components/chat/chat-workspace.tsx)
- [page.tsx](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/app/chat/[repoId]/page.tsx)
- [globals.css](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/app/globals.css)

Tasks:

- show non-deployable state clearly
- tell user what is missing
- stop over-assertive “best fit” phrasing

### 4.3 Add evidence chips and “why” sections

Files to update:

- [page.tsx](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/app/comparison/[repoId]/page.tsx)
- [page.tsx](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/app/scan/[repoId]/page.tsx)

Tasks:

- show evidence grouped by runtime/data/infra/platform
- show disqualifiers
- show missing evidence

## 5. Phase 5 - Feedback and Outcome Tracking

### 5.1 Add feedback capture UI

New components:

- `src/components/feedback/recommendation-feedback.tsx`
- `src/components/feedback/outcome-feedback.tsx`
- `src/components/feedback/repo-correction.tsx`

Tasks:

- `Was this recommendation correct?`
- `What did you deploy to?`
- `What did Shipd get wrong?`
- `Mark this repo as notebook / library / service / static / infra-only`

### 5.2 Add feedback APIs and actions

New files:

- `src/app/api/feedback/route.ts`
- `src/app/api/outcomes/route.ts`

Or server actions if preferred:

- `src/app/chat/[repoId]/actions.ts`

### 5.3 Add feedback services

New files:

- `src/server/services/feedback-service.ts`
- `src/server/services/outcome-service.ts`

Tasks:

- persist structured feedback
- persist outcome events
- attach recommendation version

## 6. Phase 6 - Guide Quality

### 6.1 Separate guide generation from recommendation

New files:

- `src/lib/guides/types.ts`
- `src/lib/guides/templates.ts`
- `src/lib/guides/build-guide.ts`

Tasks:

- template-driven guide generation
- guide gating based on confidence
- explicit assumptions section
- platform-side docs selection by repo class

### 6.2 Improve docs support

Files to update:

- [platform-docs.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/platform-docs.ts)

Tasks:

- map docs by repo class + framework + platform
- avoid docs links when confidence is weak
- add Cloudflare/Wrangler docs path

## 7. Phase 7 - AI as Explanation, Not Decision Engine

### 7.1 Ground AI in v2 objects

Files to update:

- [chat-service.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/server/services/chat-service.ts)
- [orchestrator.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/ai/orchestrator.ts)
- [deployment-plan.ts](/Users/welcome/Documents/SoftwareEngineering/serendepify/shipd/src/lib/ai/schemas/deployment-plan.ts)

Tasks:

- inject repo class, archetype, evidence, disqualifiers, and open questions
- force responses to separate facts from suggestions
- ask clarifying questions when uncertainty is material

## 8. Phase 8 - Evaluation Harness

### 8.1 Add benchmark repo suite

New top-level folder:

- `evals/`

Recommended contents:

- `evals/repos/`
- `evals/fixtures/`
- `evals/expected-results.json`

### 8.2 Add evaluation runner

New files:

- `scripts/evaluate-shipd.ts`
- `evals/types.ts`

Tasks:

- compare predicted repo class to expected class
- compare top platform to expected platform
- compare blocker precision and recall
- compare recommendation version deltas

## 9. Suggested Build Order

Do this in order:

1. schema additions
2. repo classification gate
3. weak-evidence UI
4. archetype classifier
5. feedback persistence
6. feedback UI
7. guide template system
8. evaluation harness

## 10. Immediate Next PR Scope

The highest-value next implementation slice is:

- add `RecommendationVersion`
- add `ScanEvidence`
- add `RepoClassification`
- introduce repo-class gating in `analysis-service`
- show repo class in plan and comparison pages
- render `insufficient evidence` state cleanly

That gives Shipd a much better trust model without requiring the full feedback loop yet.
