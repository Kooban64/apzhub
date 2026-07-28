import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  QEP_TRACEABILITY_INFRASTRUCTURE_STATUS,
  QEP_TRACEABILITY_PROGRAMME,
  QEP_TRACEABILITY_VERSION,
  TRACE_DOMAIN_EVENT_TYPES,
  TRACE_TYPES,
  assertNormativeTaxonomyComplete,
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

describe("APZQEP-ENG-030C architecture boundaries", () => {
  it("exports programme markers and event catalogue", () => {
    expect(QEP_TRACEABILITY_VERSION).toBe("1.0.0");
    expect(QEP_TRACEABILITY_PROGRAMME).toBe(
      "APZQEP-TRACE-001 ACCEPTED CERTIFIED FROZEN 1.0.0",
    );
    expect(QEP_TRACEABILITY_INFRASTRUCTURE_STATUS).toBe("implemented");
    expect(TRACE_TYPES.length).toBeGreaterThanOrEqual(16);
    expect(TRACE_DOMAIN_EVENT_TYPES).toContain("qep.trace_link.created");
    expect(() => assertNormativeTaxonomyComplete()).not.toThrow();
  });

  it("forbids infrastructure imports in domain", () => {
    const domainRoot = join(packageRoot, "src", "domain");
    const forbidden = [
      "drizzle",
      "postgres",
      "\"pg\"",
      "'pg'",
      "@apzhub/config",
      "@apzhub/platform-services",
      "next/server",
      "node:fs",
      "fs/promises",
    ];
    const sqlish = /CREATE TABLE|INSERT INTO|SELECT \*/i;
    for (const file of collectSourceFiles(domainRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(false);
      }
      expect(sqlish.test(source), `${file} must not contain SQL`).toBe(false);
    }
  });

  it("forbids drizzle/postgres imports in the application layer", () => {
    const applicationRoot = join(packageRoot, "src", "application");
    const forbidden = ["drizzle-orm", "@apzhub/config", "postgres"];
    for (const file of collectSourceFiles(applicationRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(false);
      }
    }
  });

  it("package now has Part 2 infrastructure, application, and presentation layers", () => {
    const src = join(packageRoot, "src");
    const entries = readdirSync(src);
    expect(entries).toContain("infrastructure");
    expect(entries).toContain("application");
    expect(entries).toContain("presentation");
  });

  it("forbids react/next imports in the presentation layer (route/permission contracts only)", () => {
    const presentationRoot = join(packageRoot, "src", "presentation");
    const forbidden = ["\"react\"", "'react'", "next/", "react-dom"];
    for (const file of collectSourceFiles(presentationRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(false);
      }
    }
  });

  it("forbids Coverage/Impact engine concerns in the domain layer (ARCH-007 — no graph/coverage/impact)", () => {
    const domainRoot = join(packageRoot, "src", "domain");
    const forbidden = ["CoverageEngine", "ImpactEngine", "coverage-engine", "impact-engine"];
    for (const file of collectSourceFiles(domainRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(false);
      }
    }
  });
});
