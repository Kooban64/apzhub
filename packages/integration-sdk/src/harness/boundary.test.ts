import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const HARNESS_ROOT = join(__dirname);

const FORBIDDEN_IMPORT_PATTERNS = [
  /from\s+["']@apzhub\/integration-plane/,
  /from\s+["']@apzhub\/integration-zammad/,
  /from\s+["']@apzhub\/platform-services/,
  /from\s+["']@apzhub\/event-notification-framework/,
  /from\s+["'].*EntityMappingStore/,
  /import\s+.*EntityMappingStore/,
  /integrations\/plane/,
  /integrations\/zammad/,
  /packages\/platform-services/,
];

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("harness architecture boundary", () => {
  it("does not import plane, zammad, or platform-services", () => {
    const files = collectTsFiles(HARNESS_ROOT);
    expect(files.length).toBeGreaterThan(10);

    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${file}: matched ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
