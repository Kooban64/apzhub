import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

function listFiles(dir: string): readonly string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function sourceText(path: string): string {
  return readFileSync(path, "utf8");
}

function importViolations(
  root: string,
  forbidden: RegExp,
): readonly { readonly path: string; readonly line: string }[] {
  return listFiles(root)
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .flatMap((file) =>
      sourceText(file)
        .split("\n")
        .filter((line) => /^\s*import\b/.test(line) && forbidden.test(line))
        .map((line) => ({ path: relative(REPO_ROOT, file), line })),
    );
}

describe("testing architecture boundaries", () => {
  it("keeps testing workbench code decoupled from platform service implementations", () => {
    const violations = [
      ...importViolations(
        join(REPO_ROOT, "apps/web/components/testing"),
        /@apzhub\/platform-services/,
      ),
      ...importViolations(
        join(REPO_ROOT, "apps/web/lib/testing"),
        /@apzhub\/platform-services/,
      ),
    ];

    expect(violations).toEqual([]);
  });

  it("keeps testing-services and testing-persistence below platform-services", () => {
    expect(
      importViolations(
        join(REPO_ROOT, "packages/testing-services/src"),
        /@apzhub\/platform-services/,
      ),
    ).toEqual([]);
    expect(
      importViolations(
        join(REPO_ROOT, "packages/testing-persistence/src"),
        /@apzhub\/platform-services/,
      ),
    ).toEqual([]);
  });

  it("keeps the gateway from importing testing persistence repositories directly", () => {
    expect(
      importViolations(
        join(REPO_ROOT, "packages/platform-services/src/gateway"),
        /@apzhub\/testing-persistence|testing-persistence\/src\/repositories/,
      ),
    ).toEqual([]);
  });

  it("allows testing HTTP routes under /api/v1/testing but forbids event bus and AI assist folders", () => {
    const testingRouteRoot = join(REPO_ROOT, "apps/web/app/api/v1/testing");
    const routeFiles = listFiles(testingRouteRoot).filter((file) =>
      file.endsWith("route.ts"),
    );

    // APZTCMS-012 shipped the Testing HTTP surface — routes must exist and stay gateway-thin.
    expect(routeFiles.length).toBeGreaterThan(0);
    for (const file of routeFiles) {
      const text = sourceText(file);
      expect(text).not.toMatch(/@apzhub\/testing-services/);
      expect(text).not.toMatch(/@apzhub\/testing-persistence/);
      expect(text).not.toMatch(/from\s+["']drizzle-orm["']/);
      expect(text).not.toMatch(/multipart\/form-data/);
    }

    expect(
      existsSync(
        join(REPO_ROOT, "packages/platform-services/src/services/testing/events"),
      ),
    ).toBe(false);
    expect(
      existsSync(
        join(REPO_ROOT, "packages/platform-services/src/services/testing/event-bus"),
      ),
    ).toBe(false);
    expect(
      existsSync(join(REPO_ROOT, "packages/platform-services/src/services/testing/ai")),
    ).toBe(false);
    expect(
      existsSync(
        join(REPO_ROOT, "packages/platform-services/src/services/testing/ai-assist"),
      ),
    ).toBe(false);
  });

  it("keeps testing release governance free of HTTP and event-bus imports", () => {
    expect(
      importViolations(
        join(REPO_ROOT, "packages/platform-services/src/services/testing"),
        /from\s+["']next\/server["']|from\s+["']node:http["']/,
      ),
    ).toEqual([]);
    expect(
      existsSync(
        join(REPO_ROOT, "packages/platform-services/src/services/testing/http"),
      ),
    ).toBe(false);
  });

  it("keeps CI/CD pipeline integration free of live provider SDKs and HTTP", () => {
    const roots = [
      join(REPO_ROOT, "packages/testing-services/src/pipelines"),
      join(REPO_ROOT, "packages/platform-services/src/services/testing"),
    ];
    for (const root of roots) {
      expect(
        importViolations(
          root,
          /@octokit\/|@actions\/|gitlab|jenkins|azure-devops|circleci|buildkite|node-fetch|axios|from\s+["']node:http["']|from\s+["']undici["']/,
        ),
      ).toEqual([]);
    }
  });
});
