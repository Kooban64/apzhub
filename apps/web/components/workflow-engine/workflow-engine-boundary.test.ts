/**
 * APZWORKFLOW-009 — Workflow Engine Workbench boundary.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname);

const FORBIDDEN = [
  /@apzhub\/workflow-core/,
  /@apzhub\/workflow-persistence/,
  /@apzhub\/platform-services/,
  /@apzhub\/integration-n8n/,
  /getPlatformServiceGateway/,
  /createN8nAdapter/,
  /\bn8n\b/i,
  /\bdesigner\b/i,
  /\bdrag[- ]?drop\b/i,
  /\bEventBus\b/,
  /\/execute\b/,
  /\.execute\s*\(/,
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

describe("APZWORKFLOW-009 workflow engine workbench boundary", () => {
  it("components consume engine-api only and avoid forbidden stacks", () => {
    const files = walk(ROOT).filter((file) => !file.includes(".test."));
    expect(files.length).toBeGreaterThanOrEqual(3);

    const view = join(ROOT, "platform-workflow-engine-view.tsx");
    expect(existsSync(view)).toBe(true);
    const viewContent = readFileSync(view, "utf8");
    expect(viewContent).toContain("@/lib/workflows/engine-api");
    expect(viewContent).toContain("workflowEngineQueryKeys");
    expect(viewContent).not.toMatch(/\bfetch\s*\(/);
    expect(viewContent).toContain("READ-ONLY ENGINE");

    for (const file of files) {
      const content = stripComments(readFileSync(file, "utf8"));
      for (const pattern of FORBIDDEN) {
        expect(content, file).not.toMatch(pattern);
      }
    }
  });

  it("shell mounts WorkflowEngineWorkspaceRouter", () => {
    const page = readFileSync(join(ROOT, "../workbench-page.tsx"), "utf8");
    expect(page).toContain("WorkflowEngineWorkspaceRouter");
    expect(page).toContain("isWorkflowEngineRoute");
  });
});
