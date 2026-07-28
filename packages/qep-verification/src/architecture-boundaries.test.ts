import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  QEP_VERIFICATION_INFRASTRUCTURE_STATUS,
  QEP_VERIFICATION_PROGRAMME,
  QEP_VERIFICATION_VERSION,
  VERIFICATION_DOMAIN_EVENT_TYPES,
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

describe("APZQEP-CERT-040D architecture boundaries", () => {
  it("exports programme markers and event catalogue", () => {
    expect(QEP_VERIFICATION_VERSION).toBe("1.0.0");
    expect(QEP_VERIFICATION_PROGRAMME).toBe(
      "APZQEP-CERT-040D ACCEPTED CERTIFIED FROZEN 1.0.0",
    );
    expect(QEP_VERIFICATION_INFRASTRUCTURE_STATUS).toBe("implemented");
    expect(VERIFICATION_DOMAIN_EVENT_TYPES).toContain("qep.verification.created");
    expect(VERIFICATION_DOMAIN_EVENT_TYPES).toContain("qep.verification.verified");
    expect(VERIFICATION_DOMAIN_EVENT_TYPES).toContain("qep.verification.superseded");
  });

  it("forbids persistence / platform-services / framework imports in the domain layer", () => {
    const domainRoot = join(packageRoot, "src", "domain");
    const forbidden = [
      "drizzle",
      "postgres",
      "\"pg\"",
      "'pg'",
      "@apzhub/config",
      "@apzhub/platform-services",
      "next/server",
      "next/",
      "\"react\"",
      "'react'",
      "react-dom",
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

  it("has infrastructure, application, and presentation contract layers (UI remains in apps/web)", () => {
    const src = join(packageRoot, "src");
    const entries = readdirSync(src);
    expect(entries).toContain("infrastructure");
    expect(entries).toContain("application");
    expect(entries).toContain("presentation");
    expect(existsSync(join(src, "presentation"))).toBe(true);
  });

  it("forbids react/next imports anywhere in the package (presentation contracts only)", () => {
    const src = join(packageRoot, "src");
    const forbidden = ["\"react\"", "'react'", "next/", "react-dom"];
    for (const file of collectSourceFiles(src)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(false);
      }
    }
  });

  it("forbids Coverage/Impact/Evidence/Certification engine ownership tokens as implementations", () => {
    const domainRoot = join(packageRoot, "src", "domain");
    const forbidden = [
      "CoverageEngine",
      "ImpactEngine",
      "EvidenceEngine",
      "CertificationEngine",
      "coverage-engine",
      "impact-engine",
      "evidence-engine",
      "certification-engine",
    ];
    for (const file of collectSourceFiles(domainRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(false);
      }
    }
  });
});
