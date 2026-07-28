import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  QEP_TEST_SPECIFICATIONS_INFRASTRUCTURE_STATUS,
  QEP_TEST_SPECIFICATIONS_PROGRAMME,
  QEP_TEST_SPECIFICATIONS_VERSION,
  SPECIFICATION_DOMAIN_EVENT_TYPES,
} from "./index";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(full));
      continue;
    }
    if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("APZQEP-CERT-050D architecture boundaries", () => {
  it("exports programme markers and event catalogue", () => {
    expect(QEP_TEST_SPECIFICATIONS_VERSION).toBe("1.0.0");
    expect(QEP_TEST_SPECIFICATIONS_PROGRAMME).toBe(
      "APZQEP-TEST-SPECIFICATIONS 1.0.0 CERTIFIED FROZEN",
    );
    expect(QEP_TEST_SPECIFICATIONS_INFRASTRUCTURE_STATUS).toBe("implemented");
    expect(SPECIFICATION_DOMAIN_EVENT_TYPES).toContain("qep.specification.created");
    expect(SPECIFICATION_DOMAIN_EVENT_TYPES).toContain("qep.specification.approved");
    expect(SPECIFICATION_DOMAIN_EVENT_TYPES).toContain("qep.specification.superseded");
    expect(SPECIFICATION_DOMAIN_EVENT_TYPES).toContain(
      "qep.specification.relationship.added",
    );
  });

  it("forbids persistence / platform-services / framework imports in the domain layer", () => {
    const domainRoot = join(packageRoot, "src", "domain");
    const forbidden = [
      "drizzle",
      "postgres",
      '"pg"',
      "'pg'",
      "@apzhub/config",
      "@apzhub/platform-services",
      "next/server",
      "next/",
      '"react"',
      "'react'",
      "react-dom",
      "node:fs",
      "fs/promises",
      "CREATE TABLE",
    ];
    const sqlish = /CREATE TABLE|INSERT INTO|SELECT \*/i;
    for (const file of collectSourceFiles(domainRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
      expect(sqlish.test(source), `${file} must not contain SQL`).toBe(false);
    }
  });

  it("allows Repository port naming in domain without persistence imports", () => {
    const repositoryPort = readFileSync(
      join(
        packageRoot,
        "src",
        "domain",
        "test-specification",
        "specification-repository.ts",
      ),
      "utf8",
    );
    expect(repositoryPort.includes("TestSpecificationRepository")).toBe(true);
    expect(repositoryPort.includes("drizzle")).toBe(false);
    expect(repositoryPort.includes("@apzhub/config")).toBe(false);
  });

  it("forbids drizzle/postgres imports in the application layer", () => {
    const applicationRoot = join(packageRoot, "src", "application");
    const forbidden = ["drizzle-orm", "@apzhub/config", "postgres"];
    for (const file of collectSourceFiles(applicationRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });

  it("has infrastructure and application layers", () => {
    const src = join(packageRoot, "src");
    const entries = readdirSync(src);
    expect(entries).toContain("infrastructure");
    expect(entries).toContain("application");
    expect(entries).toContain("domain");
    expect(entries).toContain("shared");
    expect(existsSync(join(src, "infrastructure"))).toBe(true);
    expect(existsSync(join(src, "application"))).toBe(true);
  });

  it("forbids react/next imports anywhere in the package", () => {
    const src = join(packageRoot, "src");
    const forbidden = ['"react"', "'react'", "next/", "react-dom"];
    for (const file of collectSourceFiles(src)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });

  it("allows drizzle in infrastructure only", () => {
    const infraRoot = join(packageRoot, "src", "infrastructure");
    let infraUsesDrizzle = false;
    for (const file of collectSourceFiles(infraRoot)) {
      const source = readFileSync(file, "utf8");
      if (source.includes("drizzle-orm")) infraUsesDrizzle = true;
    }
    expect(infraUsesDrizzle).toBe(true);
  });

  it("forbids Coverage/Impact/Evidence/Certification engine ownership tokens as implementations", () => {
    const domainRoot = join(packageRoot, "src", "domain");
    const forbidden = [
      "CoverageEngine",
      "ImpactEngine",
      "EvidenceEngine",
      "CertificationEngine",
      "TestCaseAggregate",
      "TestSuiteAggregate",
      "ExecutionEngine",
    ];
    for (const file of collectSourceFiles(domainRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });
});
