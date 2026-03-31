import type { RepoSignals } from "@/lib/parsing/types";

export function detectPlatformConfig(filePath: string): Partial<RepoSignals> {
  const detected =
    filePath === "vercel.json"
      ? "vercel"
      : filePath === "fly.toml"
        ? "fly"
        : filePath === "railway.json"
          ? "railway"
          : null;

  return detected
    ? {
        detectedPlatformConfigs: [detected]
      }
    : {};
}

