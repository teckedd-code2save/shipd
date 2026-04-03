import type { RepoSignals } from "@/lib/parsing/types";

export function detectPlatformConfig(filePath: string): Partial<RepoSignals> {
  const detected =
    filePath.endsWith("vercel.json")
      ? "vercel"
      : filePath.endsWith("fly.toml")
        ? "fly"
        : filePath.endsWith("railway.json")
          ? "railway"
          : filePath.endsWith("render.yaml") || filePath.endsWith("render.yml")
            ? "render"
            : filePath.endsWith("netlify.toml")
              ? "netlify"
              : filePath.endsWith("wrangler.toml")
                ? "cloudflare"
          : null;

  return detected
    ? {
        detectedPlatformConfigs: [detected],
        platformConfigFiles: [filePath]
      }
    : {};
}
