import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PKG = join(__dirname, "..");

describe("@apzhub/integration-paperless boundaries", () => {
  it("depends only on integration-sdk", () => {
    const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    expect(pkg.dependencies).toEqual({
      "@apzhub/integration-sdk": "workspace:*",
    });
  });

  it("keeps REST and vendor DTOs internal", () => {
    const index = readFileSync(join(PKG, "src/index.ts"), "utf8");
    expect(index).not.toContain("PaperlessRestClient");
    expect(index).not.toContain("paperless-api-types");
  });

  it("declares a hidden ingest-capable integration manifest", () => {
    const yaml = readFileSync(join(PKG, "integration.yaml"), "utf8");
    expect(yaml).toContain("id: paperless");
    expect(yaml).toContain("engineBranding: hidden");
    expect(yaml).toContain("- upload");
    expect(yaml).toContain("- download");
    expect(yaml).not.toMatch(/\b(delete|update)\b/i);
  });
});
