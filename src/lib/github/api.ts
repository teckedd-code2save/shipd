import type { GitHubRepositorySummary } from "@/lib/github/types";

const GITHUB_API_BASE = "https://api.github.com";
const API_VERSION = "2022-11-28";

function headers(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": API_VERSION
  };
}

async function githubRequest<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: headers(token),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

async function githubResponse(path: string, token: string) {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: headers(token),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}) for ${path}`);
  }

  return response;
}

interface GitHubRepoApiRecord {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  updated_at: string;
  default_branch: string;
  owner: {
    login: string;
  };
}

interface GitHubContentFile {
  type: "file";
  encoding: string;
  content: string;
  path: string;
}

interface GitHubContentDirectoryEntry {
  type: "file" | "dir";
  path: string;
  name: string;
}

export async function listViewerRepositories(token: string): Promise<GitHubRepositorySummary[]> {
  const repos: GitHubRepoApiRecord[] = [];
  let page = 1;

  while (true) {
    const response = await githubResponse(`/user/repos?sort=updated&per_page=100&page=${page}`, token);
    const batch = (await response.json()) as GitHubRepoApiRecord[];
    repos.push(...batch);

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return repos.map((repo) => ({
    githubId: String(repo.id),
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    isPrivate: repo.private,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at
  }));
}

function decodeBase64Content(content: string) {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

export async function getRepositoryFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref?: string
) {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const content = await githubRequest<GitHubContentFile>(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${query}`,
    token
  );

  return {
    path: content.path,
    content: decodeBase64Content(content.content)
  };
}

export async function listRepositoryDirectory(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref?: string
) {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return githubRequest<GitHubContentDirectoryEntry[]>(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}${query}`,
    token
  );
}
