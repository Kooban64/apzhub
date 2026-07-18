import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "apps/web");
const CLIENT_DIR = join(ROOT, "lib/reporting");
const COMPONENT_DIR = join(ROOT, "components/reporting");
const HANDLER = join(ROOT, "lib/api/v1/handlers/reporting.ts");
const ROUTE_DIR = join(ROOT, "app/api/v1/reporting");

const FORBIDDEN = [
  /@apzhub\/testing-services/,
  /@apzhub\/reporting-core/,
  /testing-persistence/,
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

function stripComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

describe("platform reporting architecture boundary", () => {
  it("keeps presentation free of testing-services / reporting-core", () => {
    const files = [
      HANDLER,
      ...walk(CLIENT_DIR),
      ...walk(COMPONENT_DIR),
      ...walk(ROUTE_DIR),
    ];
    const violations: string[] = [];

    for (const file of files) {
      if (file.includes(".test.")) continue;
      const content = stripComments(readFileSync(file, "utf8"));
      const rel = file.replace(`${process.cwd()}/`, "");
      for (const pattern of FORBIDDEN) {
        if (pattern.test(content)) {
          violations.push(`${rel}: forbidden ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps HTTP client scoped to /api/v1/reporting", () => {
    const clientSource = stripComments(
      readFileSync(join(CLIENT_DIR, "reporting-client.ts"), "utf8"),
    );
    expect(clientSource).toContain('const API_BASE = "/api/v1"');
    expect(clientSource).toContain('path.startsWith("/reporting")');
    expect(clientSource).not.toMatch(/@apzhub\/testing-services/);
  });

  it("handlers call gateway.reporting only", () => {
    const handler = stripComments(readFileSync(HANDLER, "utf8"));
    expect(handler).toContain("gateway.reporting");
    expect(handler).not.toMatch(/@apzhub\/testing-services|@apzhub\/reporting-core/);
  });
});
