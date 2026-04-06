---
id: contributing
title: Contributing
sidebar_position: 5
---

# Contributing

## Adding a new platform rule

1. Create `src/lib/scoring/rules/<platform>.ts` implementing `PlatformRule`:

```typescript
import type { PlatformRule } from "@/lib/scoring/rules";

export const rule: PlatformRule = {
  platform: "My Platform",
  score(ctx) {
    let score = 10; // base — keep low, let signals drive it up
    if (ctx.signals.hasDockerfile) score += 20;
    if (ctx.signals.envVars.some(v => v.includes("DATABASE"))) score += 10;
    return score;
  },
  reasons(ctx) {
    const out: string[] = [];
    if (ctx.signals.hasDockerfile) out.push("Dockerfile detected — container-first deploy.");
    return out;
  },
  evidence: (ctx) => [],
  disqualifiers: (ctx) => []
};
```

2. Register it in `src/lib/scoring/engine.ts`.

3. Add deployment steps in `src/lib/analysis/platform-steps.ts`.

4. Add docs URL in `src/lib/platform-docs.ts`.

5. Bump `ACTIVE_RECOMMENDATION_VERSION.label` in `src/server/services/analysis-service.ts` so cached scans are invalidated.

## Adding a new framework or language

1. Add the value to `framework` and/or `runtime` in `src/lib/parsing/types.ts`.
2. Add it to the Zod schema in `src/lib/ai/schemas/repo-extraction.ts`.
3. Add a file handler in `src/lib/parsing/scan-repository.ts` (with ORM detection if applicable).
4. Add a rank entry in `chooseFramework()` in `scan-repository.ts`.
5. Add the file to `SCAN_TARGETS` in `src/server/services/github-scan-source.ts`.
6. Update the LLM system prompt in `src/lib/analysis/extract-repo-signals.ts`.
7. Add a label in `src/lib/archetypes/labels.ts`.

## Adding ORM detection for a new language

ORM detection lives inline in `src/lib/parsing/scan-repository.ts`, inside each language's file handler. Pattern:

```typescript
if (filePath === "my-lang.config") {
  // ... existing lang detection ...
  if (!signals.orm && content.includes("my-orm-identifier")) {
    signals = mergeSignals(signals, { orm: "my-orm", hasMigrations: true });
  }
  continue;
}
```

Then add the migration command in `createPlanFromSnapshot()` in `src/server/services/analysis-service.ts`.

## Adding an env var provider

Edit `src/lib/analysis/env-providers.ts`. Each entry maps a regex pattern to a list of provider suggestions shown in the plan card:

```typescript
{
  pattern: /MY_SERVICE_KEY/i,
  suggestion: {
    label: "My service",
    description: "An API key for My Service.",
    providers: [
      { name: "Provider A", url: "https://provider-a.com", note: "free tier available" }
    ]
  }
}
```

## Recommendation versioning

Every time scoring logic changes in a way that would produce different results for the same repo, bump `ACTIVE_RECOMMENDATION_VERSION.label` in `src/server/services/analysis-service.ts`. This invalidates cached scans and forces a re-scan on next visit.

Current version: `v6-orm-detection`.

## Running locally

```bash
npm run dev
npm run lint
npx tsc --noEmit  # type-check only
```

## Branch and PR conventions

- Branch from `main`
- One concern per PR — one platform rule, one language, one fix
- Run `npx tsc --noEmit` before opening a PR (zero errors required)
- Bump recommendation version if scoring logic changed
