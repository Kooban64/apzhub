import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const FORBIDDEN = [
  /@apzhub\/testing-/,
  /from\s+['"][^'"]*apps\//,
  /from\s+['"][^'"]*adapters\//,
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith(".test.ts")) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (full.endsWith(".ts")) acc.push(full);
  }
  return acc;
}

describe("reporting-core package isolation", () => {
  it("does not depend on testing-* packages or apps/adapters", () => {
    const files = walk(root);
    expect(files.length).toBeGreaterThan(3);
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN) {
        expect(pattern.test(content), `${file} matched ${pattern}`).toBe(false);
      }
    }
  });
});
