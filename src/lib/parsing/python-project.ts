import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

const PYTHON_PROJECT_FILES = new Set(["pyproject.toml", "requirements.txt", "Pipfile", "setup.py", "environment.yml"]);

export function parsePythonProject(filePath: string) {
  const signals: Partial<RepoSignals> = {
    framework: "python",
    runtime: "python",
    pythonProjectFiles: [filePath]
  };

  const findings: ScanFinding[] = [];

  if (PYTHON_PROJECT_FILES.has(filePath.split("/").pop() ?? filePath)) {
    findings.push({
      filePath,
      severity: "ok",
      title: "Python project file detected",
      detail: `${filePath} suggests this repository is organized as a Python application.`
    });
  }

  return {
    signals,
    findings
  };
}

export function parseNotebookFile(filePath: string) {
  return {
    signals: {
      notebookFiles: [filePath]
    } satisfies Partial<RepoSignals>,
    findings: [
      {
        filePath,
        severity: "info",
        title: "Notebook file detected",
        detail: `${filePath} looks like an exploratory notebook, not a deployment entrypoint.`
      }
    ] satisfies ScanFinding[]
  };
}
