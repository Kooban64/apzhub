import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FORBIDDEN = [
  "playwright",
  "@playwright",
  "vitest/runners",
  "junit",
  "allure",
  "apps/web",
  "@apzhub/ui",
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

describe("testing-persistence boundary", () => {
  it("forbids runner/UI imports in production source", () => {
    const files = walk(path.join(root, "src"));
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const content = readFileSync(file, "utf8").toLowerCase();
      for (const token of FORBIDDEN) {
        expect(content.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });
});
