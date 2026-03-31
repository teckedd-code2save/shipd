import { scanRepositoryFiles } from "@/lib/parsing/scan-repository";
import type { RepositoryFileMap } from "@/lib/parsing/shared";
import { hasDatabaseEnv } from "@/lib/env";

import { getCurrentGitHubAccessToken } from "@/server/services/github-account-service";
import { loadRepositoryFilesFromGitHub } from "@/server/services/github-scan-source";
import { findRepositoryById } from "@/server/services/repository-service";

function loadRepositoryFixture(_repoId: string): RepositoryFileMap {
  return {
    "package.json": JSON.stringify(
      {
        dependencies: {
          next: "15.0.0",
          react: "19.0.0",
          express: "5.0.0"
        },
        engines: {
          node: "20.x"
        },
        scripts: {
          build: "next build",
          start: "node server.js"
        }
      },
      null,
      2
    ),
    Dockerfile: `FROM node:20-alpine
WORKDIR /app
ENV STRIPE_SECRET_KEY=secret_value
COPY . .
RUN npm ci
CMD ["npm", "start"]`,
    ".env.example": `DATABASE_URL=
REDIS_URL=
NEXTAUTH_SECRET=`,
    ".github/workflows/ci.yml": `name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build`
  };
}

export async function scanRepository(repoId: string) {
  if (hasDatabaseEnv()) {
    const repository = await findRepositoryById(repoId);
    const token = await getCurrentGitHubAccessToken();

    if (repository && token) {
      const files = await loadRepositoryFilesFromGitHub({
        token,
        owner: repository.owner,
        repo: repository.name
      });

      if (Object.keys(files).length > 0) {
        return scanRepositoryFiles(files);
      }
    }
  }

  return scanRepositoryFiles(loadRepositoryFixture(repoId));
}
