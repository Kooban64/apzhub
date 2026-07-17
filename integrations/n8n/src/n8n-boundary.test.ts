import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");
const PKG = join(__dirname, "..");

describe("@apzhub/integration-n8n boundaries", () => {
  it("depends only on integration-sdk", () => {
    const pkg = JSON.parse(
      readFileSync(join(PKG, "package.json"), "utf8"),
    ) as {
      name: string;
      dependencies?: Record<string, string>;
    };
    expect(pkg.name).toBe("@apzhub/integration-n8n");
    expect(pkg.dependencies?.["@apzhub/integration-sdk"]).toBe("workspace:*");
    expect(pkg.dependencies?.["@apzhub/platform-services"]).toBeUndefined();
    expect(pkg.dependencies?.["@apzhub/workflow-core"]).toBeUndefined();
    expect(pkg.dependencies?.n8n).toBeUndefined();
  });

  it("public index does not export REST client or raw vendor types", () => {
    const index = readFileSync(join(PKG, "src/index.ts"), "utf8");
    expect(index).not.toContain("N8nRestClient");
    expect(index).not.toContain("n8n-api-types");
    expect(index).not.toContain("N8nWorkflowRecord");
  });

  it("source forbids platform/http/execute surfaces", () => {
    const sources = [
      "src/n8n-adapter.ts",
      "src/n8n-factory.ts",
      "src/services/n8n-core-services.ts",
      "src/internal/n8n-rest-client.ts",
    ];
    for (const rel of sources) {
      const body = readFileSync(join(PKG, rel), "utf8");
      expect(body, rel).not.toMatch(/@apzhub\/platform-services/);
      expect(body, rel).not.toMatch(/getPlatformServiceGateway/);
      expect(body, rel).not.toMatch(/NextRequest|\/api\/v1\/workflows/);
      expect(body, rel).not.toMatch(/from\s+["']n8n["']/);
      expect(body, rel).not.toMatch(/EventBus|BullMQ/);
    }
  });

  it("manifest declares read-only adapter metadata", () => {
    const yaml = readFileSync(join(PKG, "integration.yaml"), "utf8");
    expect(yaml).toContain("id: n8n");
    expect(yaml).toContain("APZWORKFLOW-006");
    expect(yaml).toContain("engineBranding: hidden");
    expect(yaml).not.toMatch(/\bexecute\b/i);
  });

  it("does not wire into apps/web or platform-services package.json", () => {
    const webPkg = readFileSync(join(ROOT, "apps/web/package.json"), "utf8");
    const servicesPkg = readFileSync(
      join(ROOT, "packages/platform-services/package.json"),
      "utf8",
    );
    expect(webPkg).not.toContain("@apzhub/integration-n8n");
    expect(servicesPkg).not.toContain("@apzhub/integration-n8n");
  });
});
