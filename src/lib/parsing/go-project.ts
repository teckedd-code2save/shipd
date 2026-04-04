import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

const GO_WEB_FRAMEWORKS: Record<string, string> = {
  "github.com/gin-gonic/gin": "Gin",
  "github.com/labstack/echo": "Echo",
  "github.com/gofiber/fiber": "Fiber",
  "github.com/go-chi/chi": "Chi",
  "github.com/gorilla/mux": "Gorilla Mux",
  "net/http": "stdlib http"
};

function detectGoWebFramework(content: string): string | null {
  for (const [module, label] of Object.entries(GO_WEB_FRAMEWORKS)) {
    if (content.includes(module)) return label;
  }
  return null;
}

export function parseGoProject(content: string, filePath: string) {
  const signals: Partial<RepoSignals> = {
    framework: "go",
    runtime: "go",
    goProjectFiles: [filePath]
  };

  const findings: ScanFinding[] = [];
  const detectedFramework = detectGoWebFramework(content);

  findings.push({
    filePath,
    severity: "ok",
    title: "Go module file detected",
    detail: detectedFramework
      ? `${filePath} identifies a Go project using ${detectedFramework}.`
      : `${filePath} identifies a Go project.`
  });

  return { signals, findings };
}
