/**
 * APZDOCS-003 foundation harness.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZDOCS-003 foundation", () => {
  it("ships platform document services and audit script", () => {
    expect(
      existsSync(
        join(
          ROOT,
          "packages/platform-services/src/services/documents/create-document-platform-services.ts",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(join(ROOT, "scripts/apzdocs-003-platform-services-audit.mjs")),
    ).toBe(true);
  });

  it("bumps contracts/core and platform-services for APZDOCS-003", () => {
    expect(
      JSON.parse(
        readFileSync(
          join(ROOT, "packages/document-contracts/package.json"),
          "utf8",
        ),
      ).version,
    ).toBe("0.3.0");
    expect(
      JSON.parse(
        readFileSync(join(ROOT, "packages/document-core/package.json"), "utf8"),
      ).version,
    ).toBe("0.3.0");
    expect(
      JSON.parse(
        readFileSync(
          join(ROOT, "packages/platform-services/package.json"),
          "utf8",
        ),
      ).version,
    ).toBe("0.19.0"); // certified floor after APZWORKFLOW-002 (APZDOCS-003 introduced 0.16.0)
  });

  it("gateway exposes document facets without REST handlers", () => {
    const gateway = readFileSync(
      join(
        ROOT,
        "packages/platform-services/src/gateway/platform-service-gateway.ts",
      ),
      "utf8",
    );
    expect(gateway).toContain("get documents(");
    expect(gateway).toContain("get documentStorage(");
    expect(gateway).toContain("get documentVersions(");
    expect(gateway).not.toMatch(/NextRequest|app\/api/);
  });
});
