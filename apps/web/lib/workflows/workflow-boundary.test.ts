/**
 * Workflow HTTP / typed client / workbench presentation boundary
 * (APZWORKFLOW-003 + APZWORKFLOW-004).
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

const FORBIDDEN = [
  /@apzhub\/workflow-core/,
  /@apzhub\/workflow-persistence/,
  /@apzhub\/platform-services/,
  /getPlatformServiceGateway/,
  /from\s+["']drizzle-orm/,
  /from\s+["']postgres/,
];

const WORKBENCH_FORBIDDEN = [
  ...FORBIDDEN,
  /\bn8n\b/i,
  /\bEventBus\b/,
  /\bmeilisearch\b/i,
  /\bdrag[- ]?drop\b/i,
  /\bdesigner\b/i,
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
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

describe("APZWORKFLOW-003 presentation boundary", () => {
  it("handlers do not import workflow-core or persistence", () => {
    const content = stripComments(
      readFileSync(join(ROOT, "lib/api/v1/handlers/workflows.ts"), "utf8"),
    );
    expect(content).not.toMatch(/@apzhub\/workflow-core/);
    expect(content).not.toMatch(/@apzhub\/workflow-persistence/);
    expect(content).not.toMatch(/from\s+["']drizzle-orm/);
    expect(content).not.toMatch(/from\s+["']postgres/);
    expect(content).toMatch(/getPlatformServiceGateway/);
    expect(content).toMatch(/gateway\.workflow/);
  });

  it("typed client only targets /api/v1/workflows", () => {
    const content = stripComments(
      readFileSync(join(ROOT, "lib/workflows/workflow-client.ts"), "utf8"),
    );
    expect(content).toContain("WORKFLOWS_API_BASE");
    expect(content).not.toMatch(/@apzhub\/workflow-core/);
    expect(content).not.toMatch(/@apzhub\/platform-services/);
  });

  it("workflow lib stays on typed client only", () => {
    const files = walk(join(ROOT, "lib/workflows"));
    const violations: string[] = [];
    for (const file of files) {
      if (file.includes(".test.")) continue;
      const content = stripComments(readFileSync(file, "utf8"));
      const rel = file.replace(`${ROOT}/`, "apps/web/");
      for (const pattern of FORBIDDEN) {
        if (pattern.test(content)) {
          violations.push(`${rel}: forbidden ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("workflow HTTP routes use auth and avoid execution surfaces", () => {
    const routes = walk(join(ROOT, "app/api/v1/workflows"));
    expect(routes.length).toBeGreaterThan(10);
    for (const file of routes) {
      if (file.includes(".test.")) continue;
      const content = stripComments(readFileSync(file, "utf8"));
      expect(content).not.toMatch(/execute|n8n|schedule/);
      expect(content).toMatch(/withPlatformApiAuth/);
    }
  });
});

describe("APZWORKFLOW-004 workbench presentation boundary", () => {
  it("components consume workflow-api only and avoid forbidden stacks", () => {
    const files = walk(join(ROOT, "components/workflows"));
    expect(files.length).toBeGreaterThan(3);
    const violations: string[] = [];
    for (const file of files) {
      if (file.includes(".test.")) continue;
      const content = stripComments(readFileSync(file, "utf8"));
      const rel = file.replace(`${ROOT}/`, "apps/web/");
      for (const pattern of WORKBENCH_FORBIDDEN) {
        if (pattern.test(content)) {
          violations.push(`${rel}: forbidden ${pattern}`);
        }
      }
      if (/\bfetch\s*\(/.test(content)) {
        violations.push(`${rel}: direct fetch`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("main view imports workflow-api facades", () => {
    const content = readFileSync(
      join(ROOT, "components/workflows/platform-workflows-view.tsx"),
      "utf8",
    );
    expect(content).toContain("@/lib/workflows/workflow-api");
    expect(content).toContain("workflowQueryKeys");
    expect(content).toContain("Workflow Execution Not Available");
  });

  it("workbench page mounts WorkflowsWorkspaceRouter", () => {
    const content = readFileSync(
      join(ROOT, "components/workbench-page.tsx"),
      "utf8",
    );
    expect(content).toContain("WorkflowsWorkspaceRouter");
    expect(content).toContain("workflowsActive");
  });
});
