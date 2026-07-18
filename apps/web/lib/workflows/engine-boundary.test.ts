/**
 * APZWORKFLOW-008 — Workflow Engine HTTP / client boundary.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

const FORBIDDEN = [
  /@apzhub\/workflow-core/,
  /@apzhub\/workflow-persistence/,
  /@apzhub\/platform-services/,
  /@apzhub\/integration-n8n/,
  /createN8nAdapter/,
  /from\s+["']drizzle-orm/,
];

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function stripComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

describe("APZWORKFLOW-008 engine presentation boundary", () => {
  it("handlers call gateway.workflow.engine and avoid adapter imports", () => {
    const content = stripComments(
      readFileSync(join(ROOT, "lib/api/v1/handlers/workflow-engine.ts"), "utf8"),
    );
    expect(content).toMatch(/getPlatformServiceGateway/);
    expect(content).toMatch(/gateway\.workflow\.engine/);
    for (const pattern of FORBIDDEN) {
      expect(content).not.toMatch(pattern);
    }
  });

  it("engine client layer stays HTTP-only", () => {
    const files = walk(join(ROOT, "lib/workflows")).filter(
      (file) => /engine-/.test(file) || /mock-engine-/.test(file),
    );
    expect(files.length).toBeGreaterThan(3);
    for (const file of files) {
      if (file.includes(".test.")) continue;
      const content = stripComments(readFileSync(file, "utf8"));
      for (const pattern of FORBIDDEN) {
        expect(content, file).not.toMatch(pattern);
      }
      expect(content).not.toMatch(/getPlatformServiceGateway/);
    }
  });

  it("engine routes wire authenticated handlers", () => {
    const routes = walk(join(ROOT, "app/api/v1/workflows/engine"));
    expect(routes.length).toBeGreaterThanOrEqual(12);
    for (const file of routes) {
      const content = readFileSync(file, "utf8");
      expect(content).toContain("withPlatformApiAuth");
      expect(content).toContain("handlers/workflow-engine");
      expect(content).not.toMatch(/createN8nAdapter|@apzhub\/integration-n8n/);
    }
  });
});
