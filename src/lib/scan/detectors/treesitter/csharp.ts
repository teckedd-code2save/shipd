import Parser from "tree-sitter";
import CSharp from "tree-sitter-c-sharp";

import type { ScanDetector } from "@/lib/scan/detectors/types";

const parser = new Parser();
parser.setLanguage(CSharp as unknown as Parser.Language);

function detectCSharpWebPattern(text: string) {
  if (text.includes("[ApiController]") || text.includes("ControllerBase")) return "aspnet_api";
  if (text.includes("WebApplication.CreateBuilder") || text.includes("MapGet(") || text.includes("MapControllers(")) {
    return "aspnet_core";
  }
  return null;
}

export const treeSitterCSharpDetector: ScanDetector = {
  id: "treesitter-csharp",
  phase: "early-evidence",
  supports(filePath) {
    return filePath.endsWith(".cs");
  },
  run({ filePath, content }) {
    const tree = parser.parse(content);
    const root = tree.rootNode;
    const interestingNodes = root.descendantsOfType(["attribute_list", "invocation_expression", "using_directive", "class_declaration"]);
    const sourceText = interestingNodes.map((node) => node.text).join("\n");
    const framework = detectCSharpWebPattern(sourceText || content);

    if (!framework) {
      return {};
    }

    return {
      signals: {
        framework: "csharp",
        runtime: "dotnet",
        dotnetAppType: "web",
        deploymentDescriptorFiles: [filePath]
      },
      evidence: [
        {
          kind: "framework",
          value: framework,
          sourceFile: filePath,
          confidence: 0.86
        },
        {
          kind: "entrypoint",
          value: filePath,
          sourceFile: filePath,
          confidence: 0.72
        }
      ],
      findings: [
        {
          filePath,
          severity: "ok",
          title: "C# web framework detected from source",
          detail: `Tree-sitter matched ${framework} patterns from source code in ${filePath}.`
        }
      ]
    };
  }
};
