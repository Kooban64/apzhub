import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const OPENAPI = path.resolve(__dirname, "../../docs/specs/LAW-OpenAPI-v1.yaml");
const TRUST_ROUTES_ROOT = path.resolve(
  __dirname,
  "../../apps/web/app/api/law/v1/trust",
);

describe("APZHUB-LAW-ADOPT-003 EAB-03 OpenAPI honesty", () => {
  it("documents planned paths as not shipped and trust honesty residual", () => {
    const yaml = readFileSync(OPENAPI, "utf8");
    expect(yaml).toContain("x-apzhube-implementation-honesty");
    expect(yaml).toContain("plannedPathsNotShipped");
    expect(yaml).toContain("runtimePresentNotFullyInOpenApi");
    expect(yaml).toContain("/trust/**");
    expect(yaml).toMatch(/\/search:[\s\S]*x-implementation-status:\s*planned/);
  });

  it("keeps Trust HTTP routes on disk while OpenAPI honesty notes them", () => {
    const yaml = readFileSync(OPENAPI, "utf8");
    expect(yaml).toContain("Trust Accounting HTTP routes exist");
    expect(TRUST_ROUTES_ROOT).toBeTruthy();
    const accounts = path.join(TRUST_ROUTES_ROOT, "accounts", "route.ts");
    expect(readFileSync(accounts, "utf8")).toContain("export");
  });
});
