import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const reportingRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const FORBIDDEN = [
  /from\s+['"][^'"]*apps\//,
  /from\s+['"][^'"]*adapters\//,
  /require\(\s*['"][^'"]*apps\//,
  /require\(\s*['"][^'"]*adapters\//,
  /apps\/web/,
  /\/adapters\//,
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

describe("reporting module boundary", () => {
  it("does not import from apps/ or adapters/", () => {
    const files = walk(reportingRoot);
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN) {
        expect(
          pattern.test(content),
          `${file} must not match ${pattern}`,
        ).toBe(false);
      }
    }
  });
});
