export function getPlatformDocsUrl(platform: string, framework?: string) {
  switch (platform.toLowerCase()) {
    case "vercel":
      if (framework === "nextjs" || framework === "react") {
        return "https://vercel.com/docs/frameworks/nextjs";
      }
      return "https://vercel.com/docs";
    case "railway":
      if (framework === "nextjs" || framework === "react") {
        return "https://docs.railway.com/guides/nextjs";
      }
      if (framework === "express") {
        return "https://docs.railway.com/guides/express";
      }
      if (framework === "python") {
        return "https://docs.railway.com/guides/languages-frameworks";
      }
      return "https://docs.railway.com/quick-start";
    case "fly.io":
    case "fly":
      if (framework === "nextjs" || framework === "react") {
        return "https://fly.io/docs/js/frameworks/nextjs/";
      }
      if (framework === "python") {
        return "https://fly.io/docs/python/";
      }
      return "https://fly.io/docs/js/frameworks/";
    case "render":
      if (framework === "nextjs" || framework === "react") {
        return "https://render.com/docs/deploy-nextjs-app";
      }
      if (framework === "express") {
        return "https://render.com/docs/deploy-node-express-app";
      }
      if (framework === "python") {
        return "https://render.com/docs/deploy-fastapi";
      }
      return "https://render.com/docs/your-first-deploy";
    default:
      return null;
  }
}
