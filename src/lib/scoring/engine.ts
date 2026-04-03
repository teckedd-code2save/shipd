import { buildRecommendation } from "@/lib/scoring/rules";
import { flyRule } from "@/lib/scoring/rules/fly";
import { railwayRule } from "@/lib/scoring/rules/railway";
import { renderRule } from "@/lib/scoring/rules/render";
import { vercelRule } from "@/lib/scoring/rules/vercel";
import type { PlatformRecommendation, ScoringContext } from "@/lib/scoring/types";

const rules = [railwayRule, flyRule, vercelRule, renderRule];

export function scorePlatforms(context: ScoringContext): PlatformRecommendation[] {
  return rules
    .map((rule) => buildRecommendation(rule, context))
    .sort((left, right) => right.score - left.score || right.confidence - left.confidence);
}
