import { getRepositoryFile, listRepositoryDirectory } from "@/lib/github/api";
import type { RepositoryFileMap } from "@/lib/parsing/shared";

const SCAN_TARGETS = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "setup.py",
  "environment.yml",
  "Dockerfile",
  ".env.example",
  ".env.sample",
  "README.md",
  "vercel.json",
  "fly.toml",
  "railway.json",
  "render.yaml",
  "render.yml",
  "netlify.toml",
  "wrangler.toml",
  "Procfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yml",
  "compose.yaml",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tsconfig.json"
] as const;

const INFRA_DIRECTORIES = ["infra", "infrastructure", "terraform", "deploy", ".deploy", "k8s", "kubernetes", "helm"] as const;
const MAX_INFRA_FILES = 40;
const MAX_NOTEBOOK_FILES = 6;

function isDeploymentRelevantFile(path: string) {
  return (
    path.endsWith(".tf") ||
    path.endsWith(".tfvars") ||
    path.endsWith(".yaml") ||
    path.endsWith(".yml") ||
    path.endsWith(".toml") ||
    path.endsWith(".json") ||
    path.endsWith(".env.example") ||
    path.endsWith(".env.sample")
  );
}

async function walkDirectory(args: {
  token: string;
  owner: string;
  repo: string;
  path: string;
  defaultBranch?: string;
  depth?: number;
  collected?: string[];
}) {
  const collected = args.collected ?? [];
  const depth = args.depth ?? 0;

  if (depth > 2 || collected.length >= MAX_INFRA_FILES) {
    return collected;
  }

  const entries = await listRepositoryDirectory(
    args.token,
    args.owner,
    args.repo,
    args.path,
    args.defaultBranch
  );

  for (const entry of entries) {
    if (collected.length >= MAX_INFRA_FILES) {
      break;
    }

    if (entry.type === "file" && isDeploymentRelevantFile(entry.path)) {
      collected.push(entry.path);
      continue;
    }

    if (entry.type === "dir") {
      await walkDirectory({
        ...args,
        path: entry.path,
        depth: depth + 1,
        collected
      });
    }
  }

  return collected;
}

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
    const rootEntries = await listRepositoryDirectory(
      args.token,
      args.owner,
      args.repo,
      "",
      args.defaultBranch
    );

    const notebookEntries = rootEntries
      .filter((entry) => entry.type === "file" && entry.path.endsWith(".ipynb"))
      .slice(0, MAX_NOTEBOOK_FILES);

    notebookEntries.forEach((entry) => {
      fileMap[entry.path] = "";
    });
  } catch {
    // Root directory listing may fail on some repositories.
  }

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

  for (const directory of INFRA_DIRECTORIES) {
    try {
      const paths = await walkDirectory({
        token: args.token,
        owner: args.owner,
        repo: args.repo,
        path: directory,
        defaultBranch: args.defaultBranch
      });

      await Promise.all(
        paths.map(async (path) => {
          if (fileMap[path]) {
            return;
          }

          const file = await getRepositoryFile(
            args.token,
            args.owner,
            args.repo,
            path,
            args.defaultBranch
          );
          fileMap[file.path] = file.content;
        })
      );
    } catch {
      // Infra directory may not exist.
    }
  }

  return fileMap;
}
