import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const FORBIDDEN = [
  /from\s+['"][^'"]*apps\//,
  /NextRequest/,
  /EventBus/,
  /\bn8n\b/,
  /meilisearch/,
  /bullmq/i,
  /workbench-framework/,
  /\/api\/v1\//,
  /nodemailer/i,
  /twilio/i,
  /@apzhub\/platform-services/,
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

describe("notification-persistence package isolation", () => {
  it("does not import apps, HTTP, delivery providers, or EventBus", () => {
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
