/**
 * APZDOCS-004 foundation harness.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZDOCS-004 foundation", () => {
  it("ships document HTTP routes, client, and audit", () => {
    expect(existsSync(join(ROOT, "apps/web/app/api/v1/documents/route.ts"))).toBe(
      true,
    );
    expect(
      existsSync(join(ROOT, "apps/web/lib/documents/document-client.ts")),
    ).toBe(true);
    expect(
      existsSync(join(ROOT, "scripts/apzdocs-004-document-http-audit.mjs")),
    ).toBe(true);
  });

  it("OpenAPI includes Platform Documents paths", () => {
    const yaml = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    expect(yaml).toContain("Platform Documents");
    expect(yaml).toContain("/documents:");
    expect(yaml).toContain("CreateDocumentRequest");
  });

  it("bootstrap enables documents via DOCUMENT_SERVICE_ENABLED", () => {
    const bootstrap = readFileSync(
      join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
      "utf8",
    );
    expect(bootstrap).toContain("isDocumentServiceEnabled");
    expect(bootstrap).toContain("createDocumentPlatformServicesForProduction");
  });
});
