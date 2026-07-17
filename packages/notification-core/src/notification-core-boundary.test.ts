import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const FORBIDDEN = [
  /@apzhub\/notification-persistence/,
  /@apzhub\/platform-services/,
  /@apzhub\/event-notification-framework/,
  /meilisearch/,
  /\bn8n\b/,
  /from\s+['"][^'"]*apps\//,
  /from\s+['"][^'"]*adapters\//,
  /NextRequest/,
  /EventBus/,
  /bullmq/i,
  /nodemailer/i,
  /twilio/i,
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

describe("notification-core package isolation", () => {
  it("does not import persistence, apps, delivery providers, or EventBus", () => {
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
