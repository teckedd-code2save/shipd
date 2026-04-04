import type { RepoSignals } from "@/lib/parsing/types";
import type { ScanFinding } from "@/lib/parsing/shared";

export function parseJavaProject(content: string, filePath: string) {
  const isSpringBoot =
    content.includes("spring-boot") ||
    content.includes("org.springframework.boot") ||
    content.includes("spring-boot-starter");
  const isQuarkus = content.includes("quarkus");
  const isMicronaut = content.includes("micronaut");

  const signals: Partial<RepoSignals> = {
    framework: "java",
    runtime: "java",
    javaProjectFiles: [filePath]
  };

  const framework = isSpringBoot ? "Spring Boot" : isQuarkus ? "Quarkus" : isMicronaut ? "Micronaut" : null;

  const findings: ScanFinding[] = [
    {
      filePath,
      severity: "ok",
      title: "Java project manifest detected",
      detail: framework
        ? `${filePath} identifies a Java project using ${framework}.`
        : `${filePath} identifies a Java project.`
    }
  ];

  return { signals, findings };
}
