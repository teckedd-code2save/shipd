import Parser from "tree-sitter";
import Python from "tree-sitter-python";

import type { ScanDetector } from "@/lib/scan/detectors/types";

const parser = new Parser();
parser.setLanguage(Python as unknown as Parser.Language);

function detectPythonFramework(text: string) {
  if (/\bFastAPI\s*\(/.test(text)) return "fastapi";
  if (/\bFlask\s*\(/.test(text) || /@app\.route/.test(text)) return "flask";
  if (/django/.test(text) || /get_wsgi_application/.test(text) || /get_asgi_application/.test(text)) return "django";
  return null;
}

export const treeSitterPythonDetector: ScanDetector = {
  id: "treesitter-python",
  phase: "early-evidence",
  supports(filePath) {
    return filePath.endsWith(".py");
  },
  run({ filePath, content }) {
    const tree = parser.parse(content);
    const root = tree.rootNode;
    const interestingNodes = root.descendantsOfType(["call", "decorated_definition", "import_statement", "import_from_statement"]);
    const sourceText = interestingNodes.map((node) => node.text).join("\n");
    const framework = detectPythonFramework(sourceText || content);

    if (!framework) {
      return {};
    }

    return {
      signals: {
        framework: "python",
        runtime: "python",
        deploymentDescriptorFiles: [filePath]
      },
      evidence: [
        {
          kind: "framework",
          value: framework,
          sourceFile: filePath,
          confidence: 0.88
        },
        {
          kind: "entrypoint",
          value: filePath,
          sourceFile: filePath,
          confidence: 0.76
        }
      ],
      findings: [
        {
          filePath,
          severity: "ok",
          title: "Python framework detected from source",
          detail: `Tree-sitter matched ${framework} application patterns from source code in ${filePath}.`
        }
      ]
    };
  }
};
