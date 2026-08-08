/**
 * WF-PR-01 — Workflow production bootstrap requires Postgres (no silent memory).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("WF-PR-01 workflow bootstrap durability", () => {
  const bootstrap = readFileSync(
    join(process.cwd(), "apps/web/lib/api/v1/gateway/bootstrap.ts"),
    "utf8",
  );
  const factory = readFileSync(
    join(
      process.cwd(),
      "packages/platform-services/src/services/workflow/create-workflow-platform-services.ts",
    ),
    "utf8",
  );

  it("production bootstrap requires DATABASE_URL and uses ForProduction factory", () => {
    expect(bootstrap).toContain("createWorkflowServicesBundle");
    expect(bootstrap).toContain("APZHUB_WORKFLOW_ENABLED=true requires DATABASE_URL");
    expect(bootstrap).toContain("createWorkflowPlatformServicesForProduction");
    expect(bootstrap).toContain("postgresDb: getDb()");
  });

  it("ForProduction forbids in-memory fallback", () => {
    expect(factory).toContain("createWorkflowPlatformServicesForProduction");
    expect(factory).toContain(
      "createWorkflowPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
    expect(factory).toContain('persistenceMode: "postgres"');
  });
});
