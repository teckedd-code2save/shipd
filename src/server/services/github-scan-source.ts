import { getRepositoryFile, listRepositoryDirectory } from "@/lib/github/api";
import type { RepositoryFileMap } from "@/lib/parsing/shared";

const SCAN_TARGETS = [
  "package.json",
  "turbo.json",
  "pnpm-workspace.yaml",
  "pnpm-workspace.yml",
  "nx.json",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "setup.py",
  "environment.yml",
  "main.py",
  "app.py",
  "wsgi.py",
  "asgi.py",
  "manage.py",
  "Program.cs",
  "go.mod",
  "go.sum",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "global.json",
  "Directory.Build.props",
  "Directory.Packages.props",
  "Dockerfile",
  ".env.example",
  ".env.sample",
  ".env.local",
  ".env.development",
  ".env.test",
  "README.md",
  "vercel.json",
  "fly.toml",
  "railway.toml",
  "railway.json",
  "render.yaml",
  "render.yml",
  "netlify.toml",
  "wrangler.toml",
  "Procfile",
  "apprunner.yaml",
  "apprunner.yml",
  "app.yaml",
  ".do/app.yaml",
  "azure.yaml",
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yml",
  "compose.yaml",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tsconfig.json"
] as const;

const WORKSPACE_DIRECTORIES = ["apps", "packages", "services", "sites"] as const;
const INFRA_DIRECTORIES = ["infra", "infrastructure", "terraform", "deploy", ".deploy", "k8s", "kubernetes", "helm"] as const;
const MAX_INFRA_FILES = 40;
const MAX_NOTEBOOK_FILES = 6;
const MAX_WORKSPACE_PACKAGES = 16;
const MAX_SOURCE_FILES = 30;

const WORKSPACE_SCAN_TARGETS = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "setup.py",
  "environment.yml",
  "main.py",
  "app.py",
  "wsgi.py",
  "asgi.py",
  "manage.py",
  "go.mod",
  "go.sum",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "Dockerfile",
  ".env.example",
  ".env.sample",
  ".env.local",
  ".env.development",
  "README.md",
  "vercel.json",
  "fly.toml",
  "railway.toml",
  "railway.json",
  "render.yaml",
  "render.yml",
  "netlify.toml",
  "wrangler.toml",
  "Procfile",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tsconfig.json"
] as const;

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".cs", ".go", ".rs", ".java"] as const;
const SOURCE_DIRECTORIES = ["src", "app", "pages", "api", "controllers"] as const;

const MAX_DOTNET_PROJECT_FILES = 12;

function isDotnetProjectFile(name: string) {
  return name.endsWith(".sln") || name.endsWith(".csproj");
}

async function collectDotnetProjectFiles(args: {
  token: string;
  owner: string;
  repo: string;
  rootEntries: Array<{ type: string; path: string; name: string }>;
  defaultBranch?: string;
}): Promise<string[]> {
  const paths: string[] = [];

  // Collect .sln and .csproj from root
  for (const entry of args.rootEntries) {
    if (paths.length >= MAX_DOTNET_PROJECT_FILES) break;
    if (entry.type === "file" && isDotnetProjectFile(entry.name)) {
      paths.push(entry.path);
    }
  }

  // Walk one level into subdirectories (e.g. src/ProjectName/ProjectName.csproj)
  const subdirs = args.rootEntries.filter((e) => e.type === "dir").slice(0, 10);

  for (const dir of subdirs) {
    if (paths.length >= MAX_DOTNET_PROJECT_FILES) break;
    try {
      const entries = await listRepositoryDirectory(
        args.token,
        args.owner,
        args.repo,
        dir.path,
        args.defaultBranch
      );

      for (const entry of entries) {
        if (paths.length >= MAX_DOTNET_PROJECT_FILES) break;
        if (entry.type === "file" && isDotnetProjectFile(entry.name)) {
          paths.push(entry.path);
        } else if (entry.type === "dir") {
          try {
            const subEntries = await listRepositoryDirectory(
              args.token,
              args.owner,
              args.repo,
              entry.path,
              args.defaultBranch
            );
            for (const sub of subEntries) {
              if (paths.length >= MAX_DOTNET_PROJECT_FILES) break;
              if (sub.type === "file" && isDotnetProjectFile(sub.name)) {
                paths.push(sub.path);
              }
            }
          } catch {
            // Subdirectory listing is best-effort.
          }
        }
      }
    } catch {
      // Directory listing is best-effort.
    }
  }

  return paths;
}

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

function isSourceFile(path: string) {
  return SOURCE_EXTENSIONS.some((extension) => path.endsWith(extension));
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

async function collectSourceFiles(args: {
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

  if (depth > 2 || collected.length >= MAX_SOURCE_FILES) {
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
    if (collected.length >= MAX_SOURCE_FILES) {
      break;
    }

    if (entry.type === "file" && isSourceFile(entry.path)) {
      collected.push(entry.path);
      continue;
    }

    if (entry.type === "dir" && SOURCE_DIRECTORIES.includes(entry.name as (typeof SOURCE_DIRECTORIES)[number])) {
      await collectSourceFiles({
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

    // Collect .sln and .csproj files which can't be fetched by literal path
    const dotnetPaths = await collectDotnetProjectFiles({
      token: args.token,
      owner: args.owner,
      repo: args.repo,
      rootEntries,
      defaultBranch: args.defaultBranch
    });

    await Promise.all(
      dotnetPaths.map(async (path) => {
        if (fileMap[path]) return;
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
          // Best-effort.
        }
      })
    );

    const rootSourceFiles = await collectSourceFiles({
      token: args.token,
      owner: args.owner,
      repo: args.repo,
      path: "",
      defaultBranch: args.defaultBranch
    });

    await Promise.all(
      rootSourceFiles.map(async (path) => {
        if (fileMap[path]) {
          return;
        }

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
          // Source files are best-effort.
        }
      })
    );

    const workspaceDirectories = rootEntries
      .filter((entry) => entry.type === "dir" && WORKSPACE_DIRECTORIES.includes(entry.name as (typeof WORKSPACE_DIRECTORIES)[number]))
      .map((entry) => entry.path);

    for (const directory of workspaceDirectories) {
      const packageEntries = await listRepositoryDirectory(
        args.token,
        args.owner,
        args.repo,
        directory,
        args.defaultBranch
      );

      const workspacePackages = packageEntries
        .filter((entry) => entry.type === "dir")
        .slice(0, MAX_WORKSPACE_PACKAGES);

      await Promise.all(
        workspacePackages.flatMap((pkg) =>
          WORKSPACE_SCAN_TARGETS.map(async (target) => {
            const path = `${pkg.path}/${target}`;

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
              // Nested workspace files are best-effort.
            }
          })
        )
      );

      const nestedSourceFiles = await collectSourceFiles({
        token: args.token,
        owner: args.owner,
        repo: args.repo,
        path: directory,
        defaultBranch: args.defaultBranch
      });

      await Promise.all(
        nestedSourceFiles.map(async (path) => {
          if (fileMap[path]) {
            return;
          }

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
            // Source files are best-effort.
          }
        })
      );
    }
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
        .filter((entry) => entry.type === "file" && (entry.path.endsWith(".yml") || entry.path.endsWith(".yaml")))
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
