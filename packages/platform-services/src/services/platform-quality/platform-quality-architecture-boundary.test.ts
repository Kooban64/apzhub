import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const PLATFORM_QUALITY_ROOT = join(
  REPO_ROOT,
  "packages/platform-services/src/services/platform-quality",
);

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

describe("platform-quality architecture boundaries", () => {
  it("must not import apps/web, UI packages, or HTTP route modules", () => {
    const violations = [
      ...importViolations(PLATFORM_QUALITY_ROOT, /apps\/web/),
      ...importViolations(PLATFORM_QUALITY_ROOT, /@apzhub\/ui\b/),
      ...importViolations(PLATFORM_QUALITY_ROOT, /from\s+["']next\//),
      ...importViolations(PLATFORM_QUALITY_ROOT, /app\/api\//),
    ];
    expect(violations).toEqual([]);
  });

  it("keeps HTTP, OpenAPI, Event Bus, and CI/CD out of scope for this milestone", () => {
    expect(existsSync(join(PLATFORM_QUALITY_ROOT, "events"))).toBe(false);
    expect(existsSync(join(PLATFORM_QUALITY_ROOT, "event-bus"))).toBe(false);
    expect(existsSync(join(PLATFORM_QUALITY_ROOT, "http"))).toBe(false);
    expect(existsSync(join(PLATFORM_QUALITY_ROOT, "openapi"))).toBe(false);
    expect(existsSync(join(PLATFORM_QUALITY_ROOT, "ci"))).toBe(false);
  });
});
