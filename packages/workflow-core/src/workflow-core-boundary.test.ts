import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const FORBIDDEN = [
  /@apzhub\/workflow-persistence/,
  /@apzhub\/search/,
  /meilisearch/,
  /\bn8n\b/,
  /from\s+['"][^'"]*apps\//,
  /from\s+['"][^'"]*adapters\//,
  /NextRequest/,
  /EventBus/,
  /bullmq/i,
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

describe("workflow-core package isolation", () => {
  it("does not import persistence, apps, meilisearch, or n8n", () => {
    const files = walk(root);
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN) {
        expect(pattern.test(content), `${file} matched ${pattern}`).toBe(false);
      }
    }
  });
});
