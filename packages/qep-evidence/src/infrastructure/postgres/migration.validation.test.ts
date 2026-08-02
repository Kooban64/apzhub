/**
 * Additive migration validation — APZQEP-120-S05.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const drizzleDir = join(repoRoot, "packages/config/drizzle");

describe("APZQEP-120-S05 migration SQL", () => {
  it("includes additive evidence catalogue tables and indexes", () => {
    const path = join(drizzleDir, "0089_apz_qep_evidence.sql");
    expect(existsSync(path)).toBe(true);
    const sql = readFileSync(path, "utf8");

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "qep_evidence"');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "qep_evidence_version"');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "qep_evidence_relationship"');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "qep_evidence_audit"');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "qep_evidence_collection"');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "qep_evidence_set"');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "qep_evidence_access_grant"');
    expect(sql).toContain("catalogue_state");
    expect(sql).toContain("storage_locator");
    expect(sql).toContain("qep_evidence_tenant_project_idx");
    expect(sql).toContain("qep_evidence_relationship_link_uidx");

    expect(sql.toLowerCase()).not.toContain("drop table");
    expect(sql.toLowerCase()).not.toContain("truncate");
    expect(sql).not.toMatch(/ALTER TABLE .* DROP COLUMN/i);
  });

  it("includes FORCE RLS tenant policies", () => {
    const path = join(drizzleDir, "0090_apz_qep_evidence_rls.sql");
    expect(existsSync(path)).toBe(true);
    const sql = readFileSync(path, "utf8");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("qep_evidence_tenant_isolation");
    expect(sql).toContain("current_setting('app.tenant_id'");
    expect(sql.toLowerCase()).not.toContain("drop table");
  });

  it("APZQEP-120-S06: additive lifecycle governance migration", () => {
    const path = join(drizzleDir, "0091_apz_qep_evidence_lifecycle.sql");
    expect(existsSync(path)).toBe(true);
    const sql = readFileSync(path, "utf8");
    expect(sql).toContain("lifecycle_governance_json");
    expect(sql).toContain("qep_evidence_lifecycle_history");
    expect(sql.toLowerCase()).not.toContain("drop table");
    expect(sql).not.toMatch(/ALTER TABLE .* DROP COLUMN/i);

    const rls = readFileSync(
      join(drizzleDir, "0092_apz_qep_evidence_lifecycle_rls.sql"),
      "utf8",
    );
    expect(rls).toContain("FORCE ROW LEVEL SECURITY");
    expect(rls).toContain("qep_evidence_lifecycle_history_tenant_isolation");
  });

  it("APZQEP-120-S08: enterprise platform outbox migration", () => {
    const path = join(drizzleDir, "0093_apz_platform_outbox_event.sql");
    expect(existsSync(path)).toBe(true);
    const sql = readFileSync(path, "utf8");
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "platform_outbox_event"');
    expect(sql).toContain("idempotency_key");
    expect(sql).toContain("platform_outbox_event_claim_idx");
    expect(sql.toLowerCase()).not.toContain("drop table");
    expect(sql).not.toMatch(/ALTER TABLE .* DROP COLUMN/i);

    const rls = readFileSync(
      join(drizzleDir, "0094_apz_platform_outbox_event_rls.sql"),
      "utf8",
    );
    expect(rls).toContain("FORCE ROW LEVEL SECURITY");
    expect(rls).toContain("platform_outbox_event_tenant_isolation");
  });
});
