import { archetypeCatalog } from "@/lib/archetypes/catalog";
import type { ArchetypeContext, ArchetypeMatchResult } from "@/lib/archetypes/types";

export function matchArchetypes(context: ArchetypeContext): ArchetypeMatchResult[] {
  return archetypeCatalog
    .filter((definition) => definition.appliesTo.includes(context.classification.repoClass))
    .map((definition) => {
      const result = definition.match(context);

      return {
        archetype: definition.id,
        rank: 0,
        confidence: result.confidence,
        reasons: result.reasons,
        disqualifiers: result.disqualifiers
      };
    })
    .filter((match) => match.confidence >= 0.35)
    .sort((left, right) => right.confidence - left.confidence)
    .map((match, index) => ({
      ...match,
      rank: index + 1
    }));
}
