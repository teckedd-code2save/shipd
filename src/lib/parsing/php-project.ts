import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

export function parsePhpProject(content: string, filePath: string) {
  const isLaravel =
    content.includes("laravel/framework") ||
    content.includes('"laravel"') ||
    content.includes("illuminate/");
  const isSymfony = content.includes("symfony/");

  const signals: Partial<RepoSignals> = {
    framework: "php",
    runtime: "php",
    phpProjectFiles: [filePath]
  };

  const framework = isLaravel ? "Laravel" : isSymfony ? "Symfony" : null;

  const findings: ScanFinding[] = [
    {
      filePath,
      severity: "ok",
      title: "PHP project manifest detected",
      detail: framework
        ? `${filePath} identifies a PHP project using ${framework}.`
        : `${filePath} identifies a PHP project.`
    }
  ];

  return { signals, findings };
}
