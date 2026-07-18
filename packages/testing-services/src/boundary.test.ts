import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Forbidden package import patterns — domain vocabulary (adapter kinds) is allowed. */
const FORBIDDEN_IMPORT_PATTERNS = [
  /from\s+['"]playwright['"]/,
  /from\s+['"]@playwright\//,
  /from\s+['"]vitest\/runners['"]/,
  /require\(\s*['"]playwright['"]\s*\)/,
  /require\(\s*['"]@playwright\//,
  /from\s+['"]junit['"]/,
  /from\s+['"]allure-js-commons['"]/,
  /from\s+['"]allure-commandline['"]/,
  /from\s+['"]express['"]/,
  /from\s+['"]fastify['"]/,
  /from\s+['"]next\/server['"]/,
  /from\s+['"]hono['"]/,
  /from\s+['"]@apzhub\/ui['"]/,
  /apps\/web/,
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.endsWith(".test.ts")) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (full.endsWith(".ts")) acc.push(full);
  }
  return acc;
}

describe("testing-services boundary", () => {
  it("forbids UI/API/runner package imports in production source", () => {
    const files = walk(path.join(root, "src"));
    expect(files.length).toBeGreaterThan(10);
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(content), `${file} must not match ${pattern}`).toBe(false);
      }
    }
  });
});
