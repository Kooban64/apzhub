import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  QEP_TEST_EXECUTION_APPLICATION_STATUS,
  QEP_TEST_EXECUTION_DOMAIN_STATUS,
  QEP_TEST_EXECUTION_INFRASTRUCTURE_STATUS,
  QEP_TEST_EXECUTION_PROGRAMME,
  QEP_TEST_EXECUTION_VERSION,
  createExecution,
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

describe("APZQEP-ENG-100A/100B/100C/100D architecture boundaries", () => {
  it("exports programme markers for Domain, Application and Infrastructure Waves", () => {
    expect(QEP_TEST_EXECUTION_VERSION).toBe("1.0.0");
    expect(QEP_TEST_EXECUTION_PROGRAMME).toBe(
      "APZQEP-RELEASE-001 — PRODUCTION BASELINE 1.0.0",
    );
    expect(QEP_TEST_EXECUTION_DOMAIN_STATUS).toBe("implemented-eng-100b");
    expect(QEP_TEST_EXECUTION_APPLICATION_STATUS).toBe("implemented-eng-100c");
    expect(QEP_TEST_EXECUTION_INFRASTRUCTURE_STATUS).toBe("implemented-eng-100d");
  });

  it("forbids persistence / framework imports in the domain layer", () => {
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

  it("forbids Next.js / React / SQL imports in the application layer", () => {
    const forbidden = [
      "next/server",
      "next/",
      '"react"',
      "'react'",
      "react-dom",
      "drizzle",
      "CREATE TABLE",
    ];
    const root = join(packageRoot, "src", "application");
    for (const file of collectSourceFiles(root)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });

  it("forbids Next.js / React imports in the infrastructure layer (drizzle is permitted)", () => {
    const forbidden = [
      "next/server",
      "next/",
      '"react"',
      "'react'",
      "react-dom",
      "CREATE TABLE",
    ];
    const root = join(packageRoot, "src", "infrastructure");
    for (const file of collectSourceFiles(root)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });

  it("implements Application services without infrastructure adapters", () => {
    const applicationFiles = collectSourceFiles(
      join(packageRoot, "src", "application"),
    );
    expect(
      applicationFiles.some((file) => file.endsWith("execution-command-service.ts")),
    ).toBe(true);
    expect(
      applicationFiles.some((file) => file.endsWith("external-ingestion-service.ts")),
    ).toBe(true);
    expect(
      applicationFiles.every(
        (file) => !file.includes(`${join("src", "infrastructure")}`),
      ),
    ).toBe(true);
  });

  it("implements Infrastructure persistence, adapters and factories (ENG-100D)", () => {
    const infrastructureFiles = collectSourceFiles(
      join(packageRoot, "src", "infrastructure"),
    );
    expect(infrastructureFiles.length).toBeGreaterThan(1);
    const expectedSuffixes = [
      "factories.ts",
      join("mappers", "execution-mapper.ts"),
      join("postgres", "execution-repository.ts"),
      join("postgres", "execution-history-store.ts"),
      join("postgres", "audit-port.ts"),
      join("postgres", "event-outbox-port.ts"),
      join("postgres", "search-publication-port.ts"),
      join("adapters", "permission-port.ts"),
      join("adapters", "source-resolution-port.ts"),
      join("adapters", "evidence-access-port.ts"),
      join("adapters", "clock-id-ports.ts"),
      join("in-memory", "execution-repository.ts"),
    ];
    for (const suffix of expectedSuffixes) {
      expect(
        infrastructureFiles.some((file) => file.endsWith(suffix)),
        `expected an infrastructure file ending with ${suffix}`,
      ).toBe(true);
    }
  });

  it("forbids the presentation layer from containing React/UI code (ENG-100E is routes/nav/permissions only)", () => {
    const presentationRoot = join(packageRoot, "src", "presentation");
    const forbidden = ['"react"', "'react'", "react-dom", "next/server", "next/"];
    for (const file of collectSourceFiles(presentationRoot)) {
      expect(file.endsWith(".tsx"), `${file} must not be a React component`).toBe(
        false,
      );
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });

  it("package has domain, application, infrastructure, presentation, and shared layers (APZQEP-ENG-100E)", () => {
    const src = join(packageRoot, "src");
    const entries = readdirSync(src);
    expect(entries).toContain("domain");
    expect(entries).toContain("application");
    expect(entries).toContain("infrastructure");
    expect(entries).toContain("presentation");
    expect(entries).toContain("shared");
  });

  it("implements Domain aggregate and command functions", () => {
    const domainFiles = collectSourceFiles(join(packageRoot, "src", "domain"));
    expect(domainFiles.length).toBeGreaterThan(1);
    expect(domainFiles.some((file) => file.endsWith("test-execution.ts"))).toBe(true);

    const execution = createExecution({
      id: "exec_boundary",
      executionNumber: "TE-BND",
      tenantId: "tenant_1",
      projectId: "proj_1",
      workspaceId: "ws_1",
      ownerId: "user_1",
      sourceRefs: {
        planRef: { capability: "plan", id: "plan_1", versionLabel: "1.0.0" },
      },
      createdAt: "2026-07-29T10:00:00.000Z",
      createdBy: "user_1",
    });
    expect(execution.status).toBe("draft");
  });
});
