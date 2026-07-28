/**
 * Architecture / migration boundary checks (APZHUB-ENG-0001 / R12-PERSIST-01).
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = join(__dirname, "../../../../..");

describe("R12-PERSIST-01 boundary", () => {
  it("includes drizzle migrations for automation execution journal + RLS", () => {
    const journalSql = join(
      repoRoot,
      "packages/config/drizzle/0061_apz_platform_automation_execution_journal.sql",
    );
    const rlsSql = join(
      repoRoot,
      "packages/config/drizzle/0062_apz_platform_automation_execution_journal_rls.sql",
    );
    expect(existsSync(journalSql)).toBe(true);
    expect(existsSync(rlsSql)).toBe(true);

    const journalBody = readFileSync(journalSql, "utf8");
    expect(journalBody).toContain("platform_automation_execution_journal");
    expect(journalBody).toContain("platform_automation_exec_journal_idempotency_uidx");

    const meta = JSON.parse(
      readFileSync(
        join(repoRoot, "packages/config/drizzle/meta/_journal.json"),
        "utf8",
      ),
    ) as { entries: Array<{ tag: string }> };
    const tags = meta.entries.map((e) => e.tag);
    expect(tags).toContain("0061_apz_platform_automation_execution_journal");
    expect(tags).toContain("0062_apz_platform_automation_execution_journal_rls");
  });

  it("exports production postgres journal factory from package surface", async () => {
    const mod = await import("./index");
    expect(typeof mod.createPostgresAutomationExecutionJournal).toBe("function");
    expect(typeof mod.createProductionAutomationExecutionJournal).toBe("function");
  });
});
