import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "apps/web");
const COMPONENT_DIR = join(ROOT, "components/testing");
const CLIENT_DIR = join(ROOT, "lib/testing");
const TESTING_API_ROUTE_DIR = join(ROOT, "app/api/v1/testing");
const TESTING_API_HANDLER = join(ROOT, "lib/api/v1/handlers/testing.ts");
const TESTING_PIPELINE_HANDLER = join(ROOT, "lib/api/v1/handlers/testing-pipelines.ts");
const TESTING_EI_HANDLER = join(
  ROOT,
  "lib/api/v1/handlers/testing-engineering-intelligence.ts",
);

const FORBIDDEN_IMPORT_PATTERNS = [
  /@apzhub\/platform-services/,
  /@apzhub\/testing-services/,
  /testing-persistence/,
  /from\s+["']drizzle-orm/,
  /from\s+["']drizzle\/kit/,
  /from\s+["']pg["']/,
  /from\s+["'][^"']*repositor[^"']*["']/i,
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

describe("testing UI architecture boundary", () => {
  it("does not import services, persistence, repositories, or direct component REST clients", () => {
    const files = [COMPONENT_DIR, CLIENT_DIR].flatMap((dir) => walk(dir));
    expect(files.length).toBeGreaterThan(5);

    const violations: string[] = [];

    for (const file of files) {
      if (file.includes(".test.")) continue;
      const content = readFileSync(file, "utf8");
      const rel = file.replace(`${process.cwd()}/`, "");
      const executable = stripComments(content);

      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        if (pattern.test(executable)) {
          violations.push(`${rel}: forbidden import pattern ${pattern}`);
        }
      }

      if (content.includes("dangerouslySetInnerHTML")) {
        violations.push(`${rel}: uses dangerouslySetInnerHTML`);
      }

      if (file.includes("components/testing")) {
        const fetchMatches = executable.match(/fetch\(\s*[`'"]([^`'"]+)[`'"]/g) ?? [];
        for (const match of fetchMatches) {
          violations.push(`${rel}: component fetch call ${match.trim()}`);
        }
        if (/\/api\/v1/.test(executable)) {
          violations.push(`${rel}: component references platform API directly`);
        }
      }
    }

    const componentFiles = files.filter(
      (file) => file.includes("components/testing") && !file.includes(".test."),
    );
    for (const file of componentFiles) {
      const content = readFileSync(file, "utf8");
      const rel = file.replace(`${process.cwd()}/`, "");
      if (/@apzhub\/testing-services/.test(content)) {
        violations.push(`${rel}: components must not import @apzhub/testing-services`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps the HTTP client scoped to /api/v1/testing only", () => {
    const clientSource = stripComments(
      readFileSync(join(CLIENT_DIR, "http-client.ts"), "utf8"),
    );

    expect(clientSource).toContain('const API_BASE = "/api/v1"');
    expect(clientSource).toContain('path.startsWith("/testing/")');
    expect(clientSource).not.toMatch(/\/api\/v1\/(?!testing)/);
    expect(clientSource).not.toMatch(
      /@apzhub\/platform-services|@apzhub\/testing-services|testing-persistence/,
    );
  });

  it("keeps Testing API routes behind handlers and metadata-only evidence", () => {
    const files = [
      TESTING_API_HANDLER,
      TESTING_PIPELINE_HANDLER,
      TESTING_EI_HANDLER,
      ...walk(TESTING_API_ROUTE_DIR),
    ];
    const violations: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const rel = file.replace(`${process.cwd()}/`, "");
      const executable = stripComments(content);

      if (/@apzhub\/testing-services/.test(executable)) {
        violations.push(`${rel}: imports @apzhub/testing-services`);
      }
      if (/@apzhub\/testing-persistence|testing-persistence/.test(executable)) {
        violations.push(`${rel}: imports testing persistence`);
      }
      if (/integration-github-actions/.test(executable)) {
        violations.push(`${rel}: imports integration-github-actions`);
      }
      if (
        /multipart|formData\(|request\.formData|Content-Type["']?\s*,\s*["']multipart/i.test(
          executable,
        )
      ) {
        violations.push(`${rel}: exposes binary evidence route`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps the pipeline HTTP client scoped to /api/v1/testing/pipelines", () => {
    const clientSource = stripComments(
      readFileSync(join(CLIENT_DIR, "pipeline-client.ts"), "utf8"),
    );
    expect(clientSource).toContain('const API_BASE = "/api/v1"');
    expect(clientSource).toContain('path.startsWith("/testing/pipelines")');
    expect(clientSource).not.toMatch(
      /@apzhub\/platform-services|@apzhub\/testing-services|testing-persistence|integration-github-actions/,
    );
  });

  it("keeps the Engineering Intelligence HTTP client scoped to /api/v1/testing/engineering-intelligence", () => {
    const clientSource = stripComments(
      readFileSync(join(CLIENT_DIR, "engineering-intelligence-client.ts"), "utf8"),
    );
    expect(clientSource).toContain('const API_BASE = "/api/v1"');
    expect(clientSource).toContain(
      'path.startsWith("/testing/engineering-intelligence")',
    );
    expect(clientSource).not.toMatch(
      /@apzhub\/platform-services|@apzhub\/testing-services|testing-persistence|integration-github-actions/,
    );
  });

  it("keeps executive dashboards presentation-only over Engineering Intelligence client", () => {
    const viewSource = stripComments(
      readFileSync(
        join(COMPONENT_DIR, "testing-executive-dashboards-view.tsx"),
        "utf8",
      ),
    );
    const panelsSource = stripComments(
      readFileSync(join(COMPONENT_DIR, "executive-dashboard-panels.tsx"), "utf8"),
    );
    expect(viewSource).not.toMatch(
      /@apzhub\/platform-services|@apzhub\/testing-services|testing-persistence/,
    );
    expect(panelsSource).not.toMatch(
      /@apzhub\/platform-services|@apzhub\/testing-services|testing-persistence|fetch\(/,
    );
    expect(viewSource).toContain("getEngineeringQualityScore");
    expect(viewSource).toContain("listEngineeringTrends");
  });

  it("does not introduce AI folders in the Testing workbench", () => {
    const files = [
      ...walk(COMPONENT_DIR),
      ...walk(CLIENT_DIR),
      ...walk(TESTING_API_ROUTE_DIR),
    ];
    expect(
      files.filter((file) => /(^|\/)ai(\/|$)|ai-assist|copilot/i.test(file)),
    ).toEqual([]);
  });
});
