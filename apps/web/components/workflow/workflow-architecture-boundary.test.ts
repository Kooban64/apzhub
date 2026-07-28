import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "apps/web");
const SCAN_DIRS = [join(ROOT, "components/workflow"), join(ROOT, "lib/workflow")];

const FORBIDDEN_IMPORT_PATTERNS = [
  /@apzhub\/integration-n8n/,
  /from\s+["']@apzhub\/platform-services["']/,
  /from\s+["']@apzhub\/platform-services\//,
  /from\s+["']@\/lib\/workflows\//,
  /from\s+["']@\/lib\/workflows["']/,
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

describe("workflow UI architecture boundary", () => {
  it("does not import n8n, gateways, platform-services, or SoR workflow clients", () => {
    const files = SCAN_DIRS.flatMap((dir) => walk(dir));
    expect(files.length).toBeGreaterThan(10);

    const violations: string[] = [];
    for (const file of files) {
      if (file.includes(".test.")) continue;
      const content = readFileSync(file, "utf8");
      const rel = file.replace(`${process.cwd()}/`, "");

      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${rel}: forbidden import pattern ${pattern}`);
        }
      }

      if (/\bn8n\b/i.test(content) && !rel.endsWith("errors.ts")) {
        violations.push(`${rel}: contains n8n string`);
      }

      if (content.includes("getPlatformServiceGateway")) {
        violations.push(`${rel}: gateway reference`);
      }

      if (content.includes("dangerouslySetInnerHTML")) {
        violations.push(`${rel}: uses dangerouslySetInnerHTML`);
      }
    }

    const apiSource = readFileSync(join(ROOT, "lib/workflow/workflow-api.ts"), "utf8");
    expect(apiSource.includes('const API_BASE = "/api/v1"')).toBe(true);
    expect(apiSource.includes("/workflow/")).toBe(true);
    expect(apiSource.includes("@apzhub/integration-n8n")).toBe(false);

    expect(violations, violations.join("\n")).toEqual([]);
  });
});
