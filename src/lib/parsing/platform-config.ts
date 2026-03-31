import type { RepoSignals } from "@/lib/parsing/types";

export function detectPlatformConfig(filePath: string): Partial<RepoSignals> {
  const detected =
    filePath === "vercel.json"
      ? "vercel"
      : filePath === "fly.toml"
        ? "fly"
        : filePath === "railway.json"
          ? "railway"
          : filePath === "render.yaml" || filePath === "render.yml"
            ? "render"
            : filePath === "netlify.toml"
              ? "netlify"
              : filePath === "wrangler.toml"
                ? "cloudflare"
          : null;

  return detected
    ? {
        detectedPlatformConfigs: [detected],
        platformConfigFiles: [filePath]
      }
    : {};
}
