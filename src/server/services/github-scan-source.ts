import { getRepositoryFile, listRepositoryDirectory } from "@/lib/github/api";
import type { RepositoryFileMap } from "@/lib/parsing/shared";

const SCAN_TARGETS = [
  "package.json",
  "Dockerfile",
  ".env.example",
  "README.md",
  "vercel.json",
  "fly.toml",
  "railway.json",
  "docker-compose.yml",
  "next.config.js",
  "tsconfig.json"
] as const;

export async function loadRepositoryFilesFromGitHub(args: {
  token: string;
  owner: string;
  repo: string;
  defaultBranch?: string;
}) {
  const fileMap: RepositoryFileMap = {};

  await Promise.all(
    SCAN_TARGETS.map(async (path) => {
      try {
        const file = await getRepositoryFile(
          args.token,
          args.owner,
          args.repo,
          path,
          args.defaultBranch
        );
        fileMap[file.path] = file.content;
      } catch {
        // Missing files are expected; Shipd should work with partial signals.
      }
    })
  );

  try {
    const workflowEntries = await listRepositoryDirectory(
      args.token,
      args.owner,
      args.repo,
      ".github/workflows",
      args.defaultBranch
    );

    await Promise.all(
      workflowEntries
        .filter((entry) => entry.type === "file")
        .map(async (entry) => {
          const file = await getRepositoryFile(
            args.token,
            args.owner,
            args.repo,
            entry.path,
            args.defaultBranch
          );
          fileMap[file.path] = file.content;
        })
    );
  } catch {
    // Workflow directory may not exist.
  }

  return fileMap;
}

