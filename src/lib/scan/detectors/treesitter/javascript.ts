import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";
import TypeScript from "tree-sitter-typescript";

import type { ScanDetector } from "@/lib/scan/detectors/types";

const parser = new Parser();

function asLanguage(language: unknown) {
  return language as Parser.Language;
}

function languageForFile(filePath: string) {
  if (filePath.endsWith(".ts")) return asLanguage(TypeScript.typescript);
  if (filePath.endsWith(".tsx")) return asLanguage(TypeScript.tsx);
  return asLanguage(JavaScript);
}

function detectFrameworkFromText(text: string) {
  if (text.includes("\"next\"") || text.includes("'next'") || text.includes("\"next/") || text.includes("'next/")) {
    return "nextjs" as const;
  }

  if (text.includes("\"express\"") || text.includes("'express'") || /\bexpress\s*\(/.test(text)) {
    return "express" as const;
  }

  if (text.includes("\"react\"") || text.includes("'react'")) {
    return "react" as const;
  }

  return null;
}

export const treeSitterJavascriptDetector: ScanDetector = {
  id: "treesitter-javascript",
  phase: "early-evidence",
  supports(filePath) {
    return [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"].some((extension) => filePath.endsWith(extension));
  },
  run({ filePath, content }) {
    parser.setLanguage(languageForFile(filePath));
    const tree = parser.parse(content);
    const root = tree.rootNode;
    const interestingNodes = root.descendantsOfType(["import_statement", "call_expression", "export_statement"]);
    const sourceText = interestingNodes.map((node) => node.text).join("\n");
    const framework = detectFrameworkFromText(sourceText || content);

    if (!framework) {
      return {};
    }

    return {
      signals: {
        framework,
        runtime: framework === "nextjs" || framework === "express" || framework === "react" ? "node20" : undefined
      },
      evidence: [
        {
          kind: "framework",
          value: framework,
          sourceFile: filePath,
          confidence: filePath.includes("/app/") || filePath.includes("/pages/") || filePath.includes("/src/") ? 0.9 : 0.78
        }
      ],
      findings: [
        {
          filePath,
          severity: "ok",
          title: "Framework pattern detected from source",
          detail: `Tree-sitter matched ${framework} patterns from source code in ${filePath}.`
        }
      ]
    };
  }
};
