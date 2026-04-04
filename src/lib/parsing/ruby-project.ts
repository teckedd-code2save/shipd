import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

export function parseRubyProject(content: string, filePath: string) {
  const isRails = /\brails\b/i.test(content);
  const isSinatra = /\bsinatra\b/i.test(content);

  const signals: Partial<RepoSignals> = {
    framework: "ruby",
    runtime: "ruby",
    rubyProjectFiles: [filePath]
  };

  const framework = isRails ? "Rails" : isSinatra ? "Sinatra" : null;

  const findings: ScanFinding[] = [
    {
      filePath,
      severity: "ok",
      title: "Ruby project file detected",
      detail: framework
        ? `${filePath} identifies a Ruby project using ${framework}.`
        : `${filePath} identifies a Ruby project.`
    }
  ];

  return { signals, findings };
}
