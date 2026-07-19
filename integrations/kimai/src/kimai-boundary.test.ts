import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PKG = join(__dirname, "..");

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (entry.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("@apzhub/integration-kimai boundaries", () => {
  it("depends only on integration-sdk", () => {
    const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8")) as {
      name: string;
      dependencies?: Record<string, string>;
    };
    expect(pkg.name).toBe("@apzhub/integration-kimai");
    expect(pkg.dependencies?.["@apzhub/integration-sdk"]).toBe("workspace:*");
    expect(pkg.dependencies?.["@apzhub/platform-services"]).toBeUndefined();
    expect(pkg.dependencies?.["@apzhub/platform-service-contracts"]).toBeUndefined();
    expect(Object.keys(pkg.dependencies ?? {})).toEqual(["@apzhub/integration-sdk"]);
  });

  it("public index does not export REST client or vendor DTOs", () => {
    const index = readFileSync(join(PKG, "src/index.ts"), "utf8");
    expect(index).not.toContain("KimaiRestClient");
    expect(index).not.toContain("kimai-api-types");
    expect(index).not.toContain("KimaiVersionResponse");
  });

  it("source forbids Time product / platform service / HTTP surfaces", () => {
    const productionSources = collectTsFiles(join(PKG, "src")).filter(
      (file) => !file.endsWith(".test.ts"),
    );
    for (const file of productionSources) {
      const body = readFileSync(file, "utf8");
      expect(body, file).not.toMatch(/from\s+["']@apzhub\/platform-services["']/);
      expect(body, file).not.toMatch(
        /(?:import|export|class|function|interface|type)\s+TimeTrackingService/,
      );
      expect(body, file).not.toMatch(/getPlatformServiceGateway/);
      expect(body, file).not.toMatch(/NextRequest|\/api\/v1\/time/);
      expect(body, file).not.toMatch(/from\s+["']kimai["']/);
      expect(body, file).not.toMatch(/apps\/web\/components\/time/);
    }
  });

  it("manifest declares domain adapter metadata", () => {
    const yaml = readFileSync(join(PKG, "integration.yaml"), "utf8");
    expect(yaml).toContain("id: kimai");
    expect(yaml).toContain("APZHUB-INTEGRATION-KIMAI-002");
    expect(yaml).toContain("engineBranding: hidden");
    expect(yaml).toContain("userVisible: false");
    expect(yaml).toMatch(/\btimesheets\b/i);
  });

  it("implements domain CE paths in rest client", () => {
    const client = readFileSync(join(PKG, "src/internal/kimai-rest-client.ts"), "utf8");
    expect(client).toContain("/ping");
    expect(client).toContain("/version");
    expect(client).toMatch(/\/timesheets/);
    expect(client).toMatch(/\/activities/);
    expect(client).toMatch(/\/projects/);
    expect(client).toMatch(/\/customers/);
    expect(client).toMatch(/\/tags/);
  });
});
