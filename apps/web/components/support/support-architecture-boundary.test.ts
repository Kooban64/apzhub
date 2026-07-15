import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "apps/web");
const SCAN_DIRS = [
  join(ROOT, "components/support"),
  join(ROOT, "lib/support"),
];

const FORBIDDEN_IMPORT_PATTERNS = [
  /@apzhub\/integration-zammad/,
  /integration-zammad/,
  /EntityMappingStore/,
  /support-service-impls/,
  /support-mapping-helpers/,
  /providers\/zammad/,
  /from\s+["']@apzhub\/platform-services["']/,
  /from\s+["']@apzhub\/platform-services\//,
];

const FORBIDDEN_STRINGS = [
  /zammad/i,
  /\/api\/platform\/v1\/support/,
  /getPlatformServiceGateway/,
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

describe("support UI architecture boundary", () => {
  it("does not import engines, providers, gateways, or mapping stores", () => {
    const files = SCAN_DIRS.flatMap((dir) => walk(dir));
    expect(files.length).toBeGreaterThan(10);

    const violations: string[] = [];
    for (const file of files) {
      if (file.includes(".test.")) continue;
      const content = readFileSync(file, "utf8");
      const rel = file.replace(process.cwd() + "/", "");

      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${rel}: forbidden import pattern ${pattern}`);
        }
      }

      // Allow product-safe comments mentioning "never Zammad" only in tests; production UI must not label Zammad.
      if (/zammad/i.test(content) && !rel.includes("sanitize") && !rel.includes("errors")) {
        // errors.ts intentionally filters provider strings
        if (!rel.endsWith("errors.ts")) {
          violations.push(`${rel}: contains zammad string`);
        }
      }

      if (content.includes("dangerouslySetInnerHTML")) {
        violations.push(`${rel}: uses dangerouslySetInnerHTML`);
      }

      // Client fetch targets must be /api/v1 when present
      const fetchMatches = content.match(/fetch\(\s*[`'"]([^`'"]+)[`'"]/g) ?? [];
      for (const match of fetchMatches) {
        if (!match.includes("/api/v1") && match.includes("/api/")) {
          violations.push(`${rel}: non-v1 API fetch ${match}`);
        }
      }
    }

    // support-api must only talk to /api/v1
    const apiSource = readFileSync(join(ROOT, "lib/support/support-api.ts"), "utf8");
    expect(apiSource).toContain('const API_BASE = "/api/v1"');
    expect(apiSource).not.toMatch(/zammad/i);

    for (const pattern of FORBIDDEN_STRINGS) {
      if (pattern.source.includes("zammad")) continue;
      if (pattern.test(apiSource)) {
        violations.push(`support-api.ts: ${pattern}`);
      }
    }

    expect(violations).toEqual([]);
  });
});
