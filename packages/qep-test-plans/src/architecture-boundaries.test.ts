import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  PLAN_DOMAIN_EVENT_TYPES,
  QEP_TEST_PLANS_PROGRAMME,
  QEP_TEST_PLANS_VERSION,
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

describe("APZQEP-ENG-060A/060B architecture boundaries", () => {
  it("exports programme markers and event catalogue", () => {
    expect(QEP_TEST_PLANS_VERSION).toBe("1.0.0");
    expect(QEP_TEST_PLANS_PROGRAMME).toBe(
      "APZQEP-TEST-PLANS 1.0.0 CERTIFIED FROZEN",
    );
    expect(PLAN_DOMAIN_EVENT_TYPES).toContain("qep.plan.created");
    expect(PLAN_DOMAIN_EVENT_TYPES).toContain("qep.plan.approved");
    expect(PLAN_DOMAIN_EVENT_TYPES).toContain("qep.plan.superseded");
    expect(PLAN_DOMAIN_EVENT_TYPES).toContain("qep.plan.item.added");
  });

  it("forbids persistence / platform-services / framework imports in the certified domain layer", () => {
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
      "CREATE TABLE",
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

  it("forbids Next.js / React framework imports in application and infrastructure layers", () => {
    const forbidden = ["next/server", "next/", "\"react\"", "'react'", "react-dom"];
    for (const layer of ["application", "infrastructure"]) {
      const root = join(packageRoot, "src", layer);
      for (const file of collectSourceFiles(root)) {
        const source = readFileSync(file, "utf8");
        for (const token of forbidden) {
          expect(source.includes(token), `${file} must not reference ${token}`).toBe(false);
        }
      }
    }
  });

  it("forbids the presentation layer from containing React/UI code (no Workbench in ENG-060B)", () => {
    const presentationRoot = join(packageRoot, "src", "presentation");
    const forbidden = ["\"react\"", "'react'", "react-dom", ".tsx", "next/server"];
    for (const file of collectSourceFiles(presentationRoot)) {
      expect(file.endsWith(".tsx"), `${file} must not be a React component`).toBe(false);
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        if (token === ".tsx") continue;
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(false);
      }
    }
  });

  it("infrastructure package has domain, application, infrastructure, presentation, and shared layers (APZQEP-ENG-060B)", () => {
    const src = join(packageRoot, "src");
    const entries = readdirSync(src);
    expect(entries).toContain("domain");
    expect(entries).toContain("shared");
    expect(entries).toContain("application");
    expect(entries).toContain("infrastructure");
    expect(entries).toContain("presentation");
  });
});
