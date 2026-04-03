# Shipd v2 - Schema and Data Plan

v2 draft · April 2026

## 1. Goal

This document defines the database and application data model changes required for Shipd v2:

- deterministic evidence extraction
- repo classification
- archetype matching
- versioned recommendations
- structured user feedback
- deploy outcome tracking

The goal is to improve recommendation quality without replacing the current product shape.

## 2. Current Data Model

Shipd already stores:

- `User`
- `Repository`
- `Scan`
- `ScanFinding`
- `PlatformScore`
- `DeploymentPlan`
- `ExportArtifact`

This is enough for v1 snapshots, but not enough for:

- evidence-level explainability
- negative repo classification
- versioned recommendation logic
- feedback loops
- offline evaluation

## 3. New v2 Concepts

Add these core concepts:

- `ScanEvidence`
- `RepoClassification`
- `ArchetypeMatch`
- `RecommendationVersion`
- `RecommendationFeedback`
- `OutcomeEvent`

These are additive and can coexist with the current models.

## 4. Prisma Model Plan

### 4.1 RecommendationVersion

Tracks the logic version used for any analysis result.

```prisma
model RecommendationVersion {
  id                String   @id @default(cuid())
  label             String   @unique
  extractorVersion  String
  classifierVersion String
  archetypeVersion  String
  mappingVersion    String
  guideVersion      String
  aiVersion         String?
  isActive          Boolean  @default(false)
  createdAt         DateTime @default(now())

  scans             Scan[]
  feedback          RecommendationFeedback[]
  outcomes          OutcomeEvent[]
}
```

### 4.2 ScanEvidence

Stores normalized evidence extracted from repo files.

```prisma
model ScanEvidence {
  id          String   @id @default(cuid())
  scanId       String
  scan         Scan     @relation(fields: [scanId], references: [id], onDelete: Cascade)
  kind         String
  value        String
  sourceFile   String
  sourceLine   Int?
  confidence   Float
  metadataJson Json?
  createdAt    DateTime @default(now())

  @@index([scanId, kind])
  @@index([sourceFile])
}
```

Examples:

- `framework` → `nextjs`
- `runtime` → `node20`
- `database` → `postgresql`
- `orm` → `prisma`
- `notebook` → `analysis.ipynb`
- `platform_config` → `vercel.json`

### 4.3 RepoClassification

Stores the repo class and reasons for that class.

```prisma
model RepoClassification {
  id           String   @id @default(cuid())
  scanId       String   @unique
  scan         Scan     @relation(fields: [scanId], references: [id], onDelete: Cascade)
  repoClass    String
  confidence   Float
  reasonsJson  Json
  blockersJson Json?
  createdAt    DateTime @default(now())
}
```

Possible `repoClass` values:

- `deployable_web_app`
- `static_site`
- `service_app`
- `python_service`
- `cloudflare_worker_app`
- `library_or_package`
- `notebook_repo`
- `infra_only`
- `insufficient_evidence`

### 4.4 ArchetypeMatch

Stores ranked archetype matches for a scan.

```prisma
model ArchetypeMatch {
  id                String   @id @default(cuid())
  scanId            String
  scan              Scan     @relation(fields: [scanId], references: [id], onDelete: Cascade)
  archetype         String
  rank              Int
  confidence        Float
  reasonsJson       Json
  disqualifiersJson Json?
  createdAt         DateTime @default(now())

  @@index([scanId, rank])
}
```

### 4.5 RecommendationFeedback

Captures user judgment and corrections.

```prisma
model RecommendationFeedback {
  id                     String   @id @default(cuid())
  userId                 String
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  repositoryId           String
  repository             Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  scanId                 String
  scan                   Scan     @relation(fields: [scanId], references: [id], onDelete: Cascade)
  recommendationVersionId String?
  recommendationVersion  RecommendationVersion? @relation(fields: [recommendationVersionId], references: [id])
  recommendedPlatform    String?
  chosenPlatform         String?
  wasRecommendationCorrect Boolean?
  deploySucceeded        Boolean?
  correctionType         String?
  correctedRepoClass     String?
  correctedFramework     String?
  correctedRuntime       String?
  note                   String?
  createdAt              DateTime @default(now())

  @@index([repositoryId, createdAt])
  @@index([scanId])
}
```

### 4.6 OutcomeEvent

Captures behavior and later outcome signals.

```prisma
model OutcomeEvent {
  id                     String   @id @default(cuid())
  userId                 String?
  user                   User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  repositoryId           String
  repository             Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  scanId                 String?
  scan                   Scan?    @relation(fields: [scanId], references: [id], onDelete: SetNull)
  recommendationVersionId String?
  recommendationVersion  RecommendationVersion? @relation(fields: [recommendationVersionId], references: [id])
  action                 String
  platform               String?
  metadataJson           Json?
  createdAt              DateTime @default(now())

  @@index([repositoryId, action, createdAt])
  @@index([scanId])
}
```

Example `action` values:

- `opened_plan`
- `opened_comparison`
- `opened_scan`
- `exported_plan`
- `selected_platform`
- `marked_correct`
- `marked_incorrect`
- `reported_success`
- `reported_failure`

## 5. Updates to Existing Models

### 5.1 Scan

Add links to versioning and new related entities.

Recommended additions:

```prisma
model Scan {
  ...
  recommendationVersionId String?
  recommendationVersion   RecommendationVersion? @relation(fields: [recommendationVersionId], references: [id])
  evidence                ScanEvidence[]
  classification          RepoClassification?
  archetypes              ArchetypeMatch[]
}
```

### 5.2 User

Add feedback and outcome relations.

```prisma
model User {
  ...
  recommendationFeedback RecommendationFeedback[]
  outcomeEvents          OutcomeEvent[]
}
```

### 5.3 Repository

Add feedback and outcome relations.

```prisma
model Repository {
  ...
  feedback RecommendationFeedback[]
  outcomes OutcomeEvent[]
}
```

## 6. JSON Contract Changes

Current `summaryJson` in `Scan` should continue to work, but v2 should treat it as a denormalized snapshot, not the source of truth.

### 6.1 Keep

- `summaryJson`
- `planJson`
- `PlatformScore.explanation`

### 6.2 New source of truth

Use normalized models for:

- evidence
- repo class
- archetypes
- recommendation version
- user feedback

## 7. Recommended Migration Order

### Migration 1

- add `RecommendationVersion`
- add nullable `recommendationVersionId` to `Scan`

### Migration 2

- add `ScanEvidence`
- add `RepoClassification`
- add `ArchetypeMatch`

### Migration 3

- add `RecommendationFeedback`
- add `OutcomeEvent`

### Migration 4

- backfill active `RecommendationVersion`
- backfill scan evidence for recent scans if desired

## 8. Data Population Strategy

### 8.1 For new scans

Every new scan should:

1. create a `Scan`
2. store normalized `ScanEvidence`
3. store `RepoClassification`
4. store `ArchetypeMatch[]`
5. store `PlatformScore[]`
6. store `DeploymentPlan`
7. attach `recommendationVersionId`

### 8.2 For existing scans

Do not block on backfilling old scans.

Use:

- lazy re-scan on user action
- backfill only if old snapshots are still useful

## 9. Feedback Collection Rules

### 9.1 Recommendation feedback

Collect once the user has seen a recommendation or guide.

### 9.2 Outcome events

Collect automatically for usage patterns:

- opening views
- selecting a platform
- exporting a plan

Collect explicitly for outcomes:

- deployed successfully
- failed to deploy
- chose another platform

## 10. Query Patterns

The new model should support these queries:

### 10.1 Why did Shipd say this?

From a repository page:

- latest scan
- latest classification
- top archetypes
- platform scores
- evidence records by kind

### 10.2 What is Shipd getting wrong?

Across the product:

- incorrect recommendations by repo class
- false positive blockers
- missing blocker reports
- platform overrides by archetype

### 10.3 Which logic version regressed?

Compare:

- recommendation acceptance by version
- deploy success by version
- override rate by version

## 11. Reporting Requirements

Minimum internal dashboards:

- repo class distribution
- insufficient evidence rate
- notebook false-positive rate
- recommendation override rate
- recommendation acceptance rate
- deploy success rate
- top correction types

## 12. Practical Notes for Current Codebase

Current code already has good anchor points:

- `analysis-service.ts`
- `scan-repository.ts`
- `scoring/*`
- `chat-service.ts`
- `dashboard/actions.ts`

This means v2 can be introduced incrementally, not as a rewrite.

The most important schema additions first are:

1. `RecommendationVersion`
2. `ScanEvidence`
3. `RepoClassification`
4. `RecommendationFeedback`
5. `OutcomeEvent`
