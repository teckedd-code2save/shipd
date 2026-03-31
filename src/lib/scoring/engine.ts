import type { RepoSignals } from "@/lib/parsing/types";
import { buildRecommendation } from "@/lib/scoring/rules";
import { flyRule } from "@/lib/scoring/rules/fly";
import { railwayRule } from "@/lib/scoring/rules/railway";
import { renderRule } from "@/lib/scoring/rules/render";
import { vercelRule } from "@/lib/scoring/rules/vercel";
import type { PlatformRecommendation } from "@/lib/scoring/types";

const rules = [railwayRule, flyRule, vercelRule, renderRule];

export function scorePlatforms(signals: RepoSignals): PlatformRecommendation[] {
  return rules
    .map((rule) => buildRecommendation(rule, signals))
    .sort((left, right) => right.score - left.score);
}
