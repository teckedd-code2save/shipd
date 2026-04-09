import Link from "next/link";

import { formatArchetypeLabel, formatRepoClassLabel, formatSeverityLabel, formatTopologyLabel } from "@/lib/archetypes/labels";
import { SiteHeader } from "@/components/layout/site-header";
import { ArrowLeftIcon, SparklesIcon } from "@/components/ui/icons";
import { Surface } from "@/components/ui/surface";
import { Heading } from "@/components/ui/typography";
import { getRepositoryAnalysis } from "@/server/services/analysis-service";
import { PlanLimitError } from "@/server/services/plan-limit-service";
import { findRepositoryById } from "@/server/services/repository-service";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";

function formatRoot(value?: string) {
  if (!value) return "Not selected";
  return value === "." ? "repo root" : value;
}

export default async function ScanPage({
  params
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;

  let analysis: Awaited<ReturnType<typeof getRepositoryAnalysis>>;
  try {
    analysis = await getRepositoryAnalysis(repoId);
  } catch (err) {
    if (err instanceof PlanLimitError) {
      return (
        <>
          <SiteHeader />
          <main className="page">
            <UpgradePrompt kind={err.kind} />
          </main>
        </>
      );
    }
    throw err;
  }

  const repository = await findRepositoryById(repoId);
  const repoLabel = repository ? `${repository.owner}/${repository.name}` : repoId;

  return (
    <>
      <SiteHeader />
      <main className="page">
        <div className="subpage-toolbar">
          <Link href={`/chat/${repoId}`} className="subpage-back-link">
            <ArrowLeftIcon size={16} />
            Back to plan
          </Link>
          <div className="subpage-context">
            <SparklesIcon size={14} />
            <span>Scan details come from the same saved deployment workspace.</span>
          </div>
        </div>
        <Heading as="h1" size="hero" className="mb-1.5 mt-0">
          What Shipd detected
        </Heading>
        <p className="muted mb-5 text-[14px]">
          {repoLabel}
        </p>
        <Surface className="mb-[18px] grid gap-2.5 p-[18px]">
          <div className="flex flex-wrap gap-2.5">
            <span className="repo-chip">{formatTopologyLabel(analysis.signals.repoTopology ?? "unknown")}</span>
            {analysis.signals.primaryAppRoot ? (
              <span className="repo-chip repo-chip-outline">App at: {formatRoot(analysis.signals.primaryAppRoot)}</span>
            ) : null}
            <span className="repo-chip repo-chip-outline">{formatRepoClassLabel(analysis.classification.repoClass)}</span>
            <span className="repo-chip">{Math.round(analysis.classification.confidence * 100)}% confidence</span>
            {analysis.archetypes[0] && analysis.archetypes[0].archetype !== "unknown_low_evidence" ? (
              <span className="repo-chip repo-chip-outline">
                {formatArchetypeLabel(analysis.archetypes[0].archetype)}
              </span>
            ) : null}
            <span className="repo-chip">{analysis.evidence.length} signals found</span>
          </div>
          {analysis.classification.reasons.length > 0 ? (
            <div className="muted leading-[1.7]">
              {analysis.classification.reasons.join(" ")}
            </div>
          ) : null}
        </Surface>
        <Surface className="p-5">
          {analysis.findings.length === 0 ? (
            <div className="py-7 text-center">
              <div className="mb-2 text-[15px] font-bold">Nothing to flag</div>
              <div className="muted">Shipd didn&apos;t find any deployment issues in this repository.</div>
            </div>
          ) : (
            analysis.findings.map((finding, index) => (
              <div
                key={`${finding.filePath}-${finding.title}-${finding.lineNumber ?? "na"}-${index}`}
                className={index < analysis.findings.length - 1 ? "border-b border-[var(--border)] py-[14px]" : "py-[14px]"}
              >
                <div className="mb-1.5 flex justify-between">
                  <strong className="font-mono">{finding.filePath}</strong>
                  <span className="muted">{formatSeverityLabel(finding.severity)}</span>
                </div>
                <div>{finding.title}</div>
                <div className="muted">{finding.detail}</div>
                {finding.actionText ? (
                  <div className="muted mt-1.5">
                    Action: {finding.actionText}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </Surface>
        {analysis.evidence.length > 0 ? (
          <Surface className="mt-[18px] p-5">
            <div className="mb-3 text-[15px] font-bold">What Shipd found</div>
            <div className="grid gap-3">
              {analysis.evidence.map((item, index) => (
                <div key={`${item.sourceFile}-${item.kind}-${item.value}-${index}`} className="grid gap-1">
                  <div className="flex justify-between gap-3">
                    <strong>{item.value}</strong>
                    <span className="muted">{item.kind}</span>
                  </div>
                  <div className="muted font-mono text-xs">
                    {item.sourceFile}
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        ) : null}
      </main>
    </>
  );
}
