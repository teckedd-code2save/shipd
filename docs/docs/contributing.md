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
  score: (ctx) => {
    let score = 10; // base
    if (ctx.signals.hasDockerfile) score += 20;
    // ...
    return score;
  },
  reasons: (ctx) => {
    const out: string[] = [];
    if (ctx.signals.hasDockerfile) out.push("Dockerfile detected.");
    return out;
  },
  evidence: (ctx) => [],
  disqualifiers: (ctx) => []
};
```

2. Register it in `src/lib/scoring/engine.ts`:

```typescript
import { rule as myPlatformRule } from "./rules/my-platform";

const PLATFORM_RULES = [
  // existing rules...
  myPlatformRule
];
```

3. Add deployment steps in `src/lib/analysis/platform-steps.ts`.

4. Add docs URL in `src/lib/platform-docs.ts`.

## Adding a new framework

1. Add the value to `framework` and/or `runtime` in `src/lib/parsing/types.ts`.
2. Add it to the Zod schema in `src/lib/ai/schemas/repo-extraction.ts`.
3. Add detection in `src/lib/parsing/scan-repository.ts`.
4. Add a rank entry in `chooseFramework()` in `scan-repository.ts`.
5. Update the LLM system prompt in `src/lib/analysis/extract-repo-signals.ts`.
6. Add a label in `src/lib/archetypes/labels.ts`.

## Improving classification

`src/lib/classification/classify-repository.ts` contains the deterministic classifier. Each branch returns a `RepoClassificationResult` with:

- `repoClass` — the class
- `confidence` — 0.0–1.0
- `reasons` — 1–3 short sentences
- `blockers` — deployment blockers (empty array if none)

## Running locally

```bash
npm run dev
npm run lint
npx tsc --noEmit  # type-check only
```

There is no test suite configured yet. When adding platform rules, manually test with representative repositories.

## Branch and PR conventions

- Branch from `main`
- Keep PRs focused — one platform rule, one framework, or one fix per PR
- Run `npx tsc --noEmit` before opening a PR to confirm zero type errors
