import { treeSitterCSharpDetector } from "@/lib/scan/detectors/treesitter/csharp";
import { treeSitterJavascriptDetector } from "@/lib/scan/detectors/treesitter/javascript";
import { treeSitterPythonDetector } from "@/lib/scan/detectors/treesitter/python";
import type { ScanDetector } from "@/lib/scan/detectors/types";

export const earlyEvidenceDetectors: ScanDetector[] = [
  treeSitterJavascriptDetector,
  treeSitterPythonDetector,
  treeSitterCSharpDetector
];
