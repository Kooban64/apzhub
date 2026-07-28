import { describe, expect, it } from "vitest";

import {
  BACKUP_RESTORE_DRILL_CHECKLIST,
  buildDryRunBackupRestoreEvidence,
  evaluateBackupRestoreDrillVerdict,
  isRestoreDrillEvidenceCurrent,
  validateBackupRestoreRecoveryEvidence,
  type BackupRestoreRecoveryEvidence,
} from "./backup-restore-drill";

describe("backup restore drill (R12-OPS-01)", () => {
  it("exposes the full checklist", () => {
    expect(BACKUP_RESTORE_DRILL_CHECKLIST.map((step) => step.id)).toEqual([
      "artefacts.present",
      "scope.platform-postgres",
      "marker.write",
      "backup.create",
      "restore.apply",
      "marker.verify",
      "evidence.write",
    ]);
  });

  it("builds a PASS dry-run when artefacts are present", () => {
    const evidence = buildDryRunBackupRestoreEvidence({
      environment: "dev",
      artefacts: {
        backupAndRecoveryDoc: true,
        restoreDrillRunbook: true,
        evidenceDirectory: true,
      },
      executedAt: "2026-07-20T08:00:00.000Z",
    });

    expect(evidence.verdict).toBe("PASS");
    expect(evidence.backlogItemId).toBe("R12-OPS-01");
    expect(evidence.programmeId).toBe("APZHUB-1.2-002");
    expect(validateBackupRestoreRecoveryEvidence(evidence).ok).toBe(true);
  });

  it("fails dry-run when artefacts are missing", () => {
    const evidence = buildDryRunBackupRestoreEvidence({
      environment: "dev",
      artefacts: {
        backupAndRecoveryDoc: false,
        restoreDrillRunbook: true,
        evidenceDirectory: true,
      },
    });

    expect(evidence.verdict).toBe("FAIL");
  });

  it("rejects invalid evidence", () => {
    const result = validateBackupRestoreRecoveryEvidence({
      schemaVersion: "0.0.1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("treats only live PASS evidence within max age as current", () => {
    const livePass: BackupRestoreRecoveryEvidence = {
      ...buildDryRunBackupRestoreEvidence({
        environment: "dev",
        artefacts: {
          backupAndRecoveryDoc: true,
          restoreDrillRunbook: true,
          evidenceDirectory: true,
        },
        executedAt: "2026-07-20T08:00:00.000Z",
      }),
      mode: "live",
      steps: [
        {
          id: "artefacts.present",
          title: "Backup/recovery docs and drill runbook present",
          status: "pass",
          detail: "ok",
        },
      ],
      verdict: "PASS",
    };

    expect(
      isRestoreDrillEvidenceCurrent({
        evidence: livePass,
        now: new Date("2026-07-20T12:00:00.000Z"),
        maxAgeDays: 90,
      }),
    ).toBe(true);

    expect(
      isRestoreDrillEvidenceCurrent({
        evidence: { ...livePass, mode: "dry-run" },
        now: new Date("2026-07-20T12:00:00.000Z"),
      }),
    ).toBe(false);

    expect(
      isRestoreDrillEvidenceCurrent({
        evidence: livePass,
        now: new Date("2026-12-01T00:00:00.000Z"),
        maxAgeDays: 90,
      }),
    ).toBe(false);
  });

  it("evaluates verdict from step statuses", () => {
    expect(
      evaluateBackupRestoreDrillVerdict([
        {
          id: "a",
          title: "a",
          status: "pass",
          detail: "ok",
        },
        {
          id: "b",
          title: "b",
          status: "skip",
          detail: "skipped",
        },
      ]),
    ).toBe("PASS");

    expect(
      evaluateBackupRestoreDrillVerdict([
        {
          id: "a",
          title: "a",
          status: "blocked",
          detail: "missing docker",
        },
      ]),
    ).toBe("BLOCKED");
  });
});
