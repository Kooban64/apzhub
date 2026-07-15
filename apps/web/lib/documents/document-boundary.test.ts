/**
 * Document Workbench / HTTP boundary — presentation never calls document-core/storage/gateway.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

const FORBIDDEN = [
  /@apzhub\/document-core/,
  /@apzhub\/document-persistence/,
  /@apzhub\/document-storage/,
  /@apzhub\/platform-services/,
  /getPlatformServiceGateway/,
  /@aws-sdk\/client-s3/,
];

function walk(dir: string, out: string[] = []): string[] {
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

describe("APZDOCS document presentation boundary", () => {
  it("handlers do not import document-core or storage SDKs", () => {
    const content = stripComments(
      readFileSync(join(ROOT, "lib/api/v1/handlers/documents.ts"), "utf8"),
    );
    expect(content).not.toMatch(/@apzhub\/document-core/);
    expect(content).not.toMatch(/@apzhub\/document-persistence/);
    expect(content).not.toMatch(/@apzhub\/document-storage/);
    expect(content).toMatch(/getPlatformServiceGateway/);
  });

  it("typed client only targets /api/v1/documents", () => {
    const content = stripComments(
      readFileSync(join(ROOT, "lib/documents/document-client.ts"), "utf8"),
    );
    expect(content).toContain("/api/v1/documents");
    expect(content).not.toMatch(/@apzhub\/document-core/);
    expect(content).not.toMatch(/@apzhub\/platform-services/);
  });

  it("workbench components and document lib stay on typed client only", () => {
    const files = [
      ...walk(join(ROOT, "lib/documents")),
      ...walk(join(ROOT, "components/documents")),
    ];
    const violations: string[] = [];
    for (const file of files) {
      if (file.includes(".test.")) continue;
      if (file.endsWith("document-boundary.test.ts")) continue;
      const content = stripComments(readFileSync(file, "utf8"));
      const rel = file.replace(`${ROOT}/`, "apps/web/");
      for (const pattern of FORBIDDEN) {
        if (pattern.test(content)) {
          violations.push(`${rel}: forbidden ${pattern}`);
        }
      }
      if (
        file.includes("components/documents") &&
        /(?<![\w.])fetch\s*\(/.test(content)
      ) {
        violations.push(`${rel}: direct fetch in workbench`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("document HTTP routes use auth and avoid binary transfer", () => {
    const routes = walk(join(ROOT, "app/api/v1/documents"));
    expect(routes.length).toBeGreaterThan(5);
    for (const file of routes) {
      if (file.includes(".test.")) continue;
      const content = stripComments(readFileSync(file, "utf8"));
      expect(content).not.toMatch(/multipart|FormData|createReadStream/);
      expect(content).toMatch(/withPlatformApiAuth/);
    }
  });

  it("ships Documents workbench manifests", () => {
    const parent = join(
      ROOT,
      "../../packages/workbench-framework/manifests/platform-documents/module.yaml",
    );
    const yaml = readFileSync(parent, "utf8");
    expect(yaml).toContain("platform-documents");
    expect(yaml).toContain("/workspace/documents");
    expect(yaml).toContain("document.read");
  });
});
