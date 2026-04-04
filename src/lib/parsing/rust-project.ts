import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

export function parseRustProject(content: string, filePath: string) {
  const isAxum = content.includes("axum");
  const isActix = content.includes("actix-web");
  const isRocket = content.includes("rocket");
  const isWarp = content.includes("warp");

  const signals: Partial<RepoSignals> = {
    framework: "rust",
    runtime: "rust",
    rustProjectFiles: [filePath]
  };

  const webFramework = isAxum ? "Axum" : isActix ? "Actix Web" : isRocket ? "Rocket" : isWarp ? "Warp" : null;

  const findings: ScanFinding[] = [
    {
      filePath,
      severity: "ok",
      title: "Rust project manifest detected",
      detail: webFramework
        ? `${filePath} identifies a Rust project using ${webFramework}.`
        : `${filePath} identifies a Rust project.`
    }
  ];

  return { signals, findings };
}
