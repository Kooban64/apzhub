/**
 * Flagship hardening — file-backed QEP ledgers (outside Vitest).
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerFile,
  resolveQepDataRoot,
  writeJsonLedgerFile,
} from "./qep-ledger-fs";
import {
  createQualityProject,
  getQualityProject,
  resetQualityProjectStoreForTests,
} from "./quality-project-store";

describe("qep-ledger-fs", () => {
  it("disables persist under Vitest by default", () => {
    expect(isQepLedgerPersistEnabled({ VITEST: "true" })).toBe(false);
    expect(isQepLedgerPersistEnabled({ APZHUB_QEP_LEDGER_PERSIST: "false" })).toBe(
      false,
    );
    expect(
      isQepLedgerPersistEnabled({ APZHUB_QEP_LEDGER_PERSIST: "true", VITEST: "true" }),
    ).toBe(true);
    expect(isQepLedgerPersistEnabled({ NODE_ENV: "development" })).toBe(true);
  });

  it("round-trips JSON ledger files under data root", () => {
    const dir = mkdtempSync(join(tmpdir(), "qep-ledger-"));
    try {
      writeJsonLedgerFile(dir, "row-1", { id: "row-1", ok: true });
      expect(readJsonLedgerFile<{ id: string; ok: boolean }>(dir, "row-1")).toEqual({
        id: "row-1",
        ok: true,
      });
      expect(resolveQepDataRoot("segment", { APZHUB_QEP_DATA_DIR: dir })).toBe(
        join(dir, "segment"),
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("quality-project-store persist (forced)", () => {
  const originalEnv = { ...process.env };
  let dataRoot = "";

  beforeEach(() => {
    dataRoot = mkdtempSync(join(tmpdir(), "qep-qproj-"));
    process.env.APZHUB_QEP_DATA_DIR = dataRoot;
    process.env.APZHUB_QEP_LEDGER_PERSIST = "true";
    resetQualityProjectStoreForTests();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetQualityProjectStoreForTests();
    rmSync(dataRoot, { recursive: true, force: true });
  });

  it("writes project JSON under apps/web .data when persist forced", () => {
    const project = createQualityProject({
      tenantId: "tenant-h",
      name: "Hardened Project",
      createdBy: "tester",
    });
    const onDisk = readJsonLedgerFile<{ id: string; name: string }>(
      join(dataRoot, "qep-quality-projects"),
      project.id,
    );
    expect(onDisk?.name).toBe("Hardened Project");
    expect(getQualityProject("tenant-h", project.id)?.id).toBe(project.id);
  });
});
