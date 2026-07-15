import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const LAW_API_ROOT = path.resolve(__dirname, "../../app/api/law/v1");

const EXEMPT_ROUTES = new Set([
  "health/route.ts",
  "openapi.json/route.ts",
  "openapi.yaml/route.ts",
]);

function collectRouteFiles(directory: string, prefix = ""): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry}` : entry;
    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectRouteFiles(absolutePath, relativePath));
      continue;
    }

    if (entry === "route.ts") {
      files.push(relativePath);
    }
  }

  return files;
}

describe("Law API tenant ALS coverage (TD-P09)", () => {
  it("wraps all non-exempt entity routes with withLawApiAuth", () => {
    const routeFiles = collectRouteFiles(LAW_API_ROOT);
    const missing: string[] = [];

    for (const routeFile of routeFiles) {
      if (EXEMPT_ROUTES.has(routeFile)) {
        continue;
      }

      const source = readFileSync(path.join(LAW_API_ROOT, routeFile), "utf8");
      if (!source.includes("withLawApiAuth")) {
        missing.push(routeFile);
      }
    }

    expect(missing).toEqual([]);
    expect(routeFiles.length).toBeGreaterThan(EXEMPT_ROUTES.size);
  });
});
