import { buildRecommendation } from "@/lib/scoring/rules";
import { azureAcaRule } from "@/lib/scoring/rules/azure-aca";
import { awsRule } from "@/lib/scoring/rules/aws";
import { digitalOceanRule } from "@/lib/scoring/rules/digitalocean";
import { dockerVpsRule } from "@/lib/scoring/rules/docker-vps";
import { flyRule } from "@/lib/scoring/rules/fly";
import { gcpCloudRunRule } from "@/lib/scoring/rules/gcp";
import { herokuRule } from "@/lib/scoring/rules/heroku";
import { netlifyRule } from "@/lib/scoring/rules/netlify";
import { railwayRule } from "@/lib/scoring/rules/railway";
import { renderRule } from "@/lib/scoring/rules/render";
import { vercelRule } from "@/lib/scoring/rules/vercel";
import type { PlatformRecommendation, ScoringContext } from "@/lib/scoring/types";

const rules = [
  railwayRule,
  flyRule,
  vercelRule,
  renderRule,
  azureAcaRule,
  awsRule,
  gcpCloudRunRule,
  herokuRule,
  digitalOceanRule,
  netlifyRule,
  dockerVpsRule
];

export function scorePlatforms(context: ScoringContext): PlatformRecommendation[] {
  return rules
    .map((rule) => buildRecommendation(rule, context))
    .sort((left, right) => right.score - left.score || right.confidence - left.confidence);
}
