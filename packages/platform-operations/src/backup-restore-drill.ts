/**
 * R12-OPS-01 — Backup restore drill + recovery evidence.
 * Platform Operations Control Plane extension (no redesign).
 */

export type BackupRestoreDrillMode = "dry-run" | "live";

export type BackupRestoreDrillVerdict = "PASS" | "FAIL" | "BLOCKED";

export type BackupRestoreDrillStepStatus = "pass" | "fail" | "skip" | "blocked";

export interface BackupRestoreDrillStepResult {
  readonly id: string;
  readonly title: string;
  readonly status: BackupRestoreDrillStepStatus;
  readonly detail: string;
}

export interface BackupRestoreRecoveryEvidence {
  readonly schemaVersion: "1.0.0";
  readonly programmeId: "APZHUB-1.2-002";
  readonly backlogItemId: "R12-OPS-01";
  readonly riskId: "OPS-R-04";
  readonly mode: BackupRestoreDrillMode;
  readonly executedAt: string;
  readonly environment: string;
  readonly target: {
    readonly dataClass: "platform-postgresql";
    readonly containerName?: string;
    readonly databaseName: string;
  };
  readonly steps: readonly BackupRestoreDrillStepResult[];
  readonly verdict: BackupRestoreDrillVerdict;
  readonly notes: readonly string[];
  readonly artefactPaths: readonly string[];
}

export interface BackupRestoreDrillArtefacts {
  readonly backupAndRecoveryDoc: boolean;
  readonly restoreDrillRunbook: boolean;
  readonly evidenceDirectory: boolean;
}

export const BACKUP_RESTORE_DRILL_REQUIRED_ARTEFACTS = [
  "docs/operations/BACKUP-AND-RECOVERY.md",
  "docs/operations/BACKUP-RESTORE-DRILL-RUNBOOK.md",
  "docs/operations/evidence/backup-restore/README.md",
] as const;

export const BACKUP_RESTORE_DRILL_CHECKLIST = [
  {
    id: "artefacts.present",
    title: "Backup/recovery docs and drill runbook present",
  },
  {
    id: "scope.platform-postgres",
    title: "Drill scoped to platform PostgreSQL only",
  },
  {
    id: "marker.write",
    title: "Write restore-verification marker",
  },
  {
    id: "backup.create",
    title: "Create logical backup (pg_dump)",
  },
  {
    id: "restore.apply",
    title: "Restore backup into drill database",
  },
  {
    id: "marker.verify",
    title: "Verify marker after restore",
  },
  {
    id: "evidence.write",
    title: "Persist recovery evidence record",
  },
] as const;

const EVIDENCE_SCHEMA_VERSION = "1.0.0" as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStepResult(value: unknown): value is BackupRestoreDrillStepResult {
  if (value === null || typeof value !== "object") return false;
  const step = value as Record<string, unknown>;
  return (
    isNonEmptyString(step.id) &&
    isNonEmptyString(step.title) &&
    (step.status === "pass" ||
      step.status === "fail" ||
      step.status === "skip" ||
      step.status === "blocked") &&
    isNonEmptyString(step.detail)
  );
}

/** Validate recovery evidence shape (no secrets expected). */
export function validateBackupRestoreRecoveryEvidence(value: unknown):
  | { readonly ok: true; readonly evidence: BackupRestoreRecoveryEvidence }
  | {
      readonly ok: false;
      readonly errors: readonly string[];
    } {
  const errors: string[] = [];
  if (value === null || typeof value !== "object") {
    return { ok: false, errors: ["evidence must be an object"] };
  }
  const raw = value as Record<string, unknown>;

  if (raw.schemaVersion !== EVIDENCE_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${EVIDENCE_SCHEMA_VERSION}`);
  }
  if (raw.programmeId !== "APZHUB-1.2-002") {
    errors.push("programmeId must be APZHUB-1.2-002");
  }
  if (raw.backlogItemId !== "R12-OPS-01") {
    errors.push("backlogItemId must be R12-OPS-01");
  }
  if (raw.riskId !== "OPS-R-04") {
    errors.push("riskId must be OPS-R-04");
  }
  if (raw.mode !== "dry-run" && raw.mode !== "live") {
    errors.push("mode must be dry-run or live");
  }
  if (!isNonEmptyString(raw.executedAt)) {
    errors.push("executedAt is required");
  }
  if (!isNonEmptyString(raw.environment)) {
    errors.push("environment is required");
  }
  if (raw.verdict !== "PASS" && raw.verdict !== "FAIL" && raw.verdict !== "BLOCKED") {
    errors.push("verdict must be PASS, FAIL, or BLOCKED");
  }
  if (!Array.isArray(raw.steps) || raw.steps.length === 0) {
    errors.push("steps must be a non-empty array");
  } else if (!raw.steps.every(isStepResult)) {
    errors.push("steps contain invalid entries");
  }
  if (!Array.isArray(raw.notes)) {
    errors.push("notes must be an array");
  }
  if (!Array.isArray(raw.artefactPaths)) {
    errors.push("artefactPaths must be an array");
  }

  const target = raw.target as Record<string, unknown> | undefined;
  if (!target || typeof target !== "object") {
    errors.push("target is required");
  } else {
    if (target.dataClass !== "platform-postgresql") {
      errors.push("target.dataClass must be platform-postgresql");
    }
    if (!isNonEmptyString(target.databaseName)) {
      errors.push("target.databaseName is required");
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, evidence: value as BackupRestoreRecoveryEvidence };
}

export function evaluateBackupRestoreDrillVerdict(
  steps: readonly BackupRestoreDrillStepResult[],
): BackupRestoreDrillVerdict {
  if (steps.some((step) => step.status === "fail")) return "FAIL";
  if (steps.some((step) => step.status === "blocked")) return "BLOCKED";
  if (steps.every((step) => step.status === "pass" || step.status === "skip")) {
    return "PASS";
  }
  return "FAIL";
}

export function buildDryRunBackupRestoreEvidence(input: {
  readonly environment: string;
  readonly artefacts: BackupRestoreDrillArtefacts;
  readonly executedAt?: string;
}): BackupRestoreRecoveryEvidence {
  const executedAt = input.executedAt ?? new Date().toISOString();
  const artefactsOk =
    input.artefacts.backupAndRecoveryDoc &&
    input.artefacts.restoreDrillRunbook &&
    input.artefacts.evidenceDirectory;

  const steps: BackupRestoreDrillStepResult[] = [
    {
      id: "artefacts.present",
      title: "Backup/recovery docs and drill runbook present",
      status: artefactsOk ? "pass" : "fail",
      detail: artefactsOk
        ? "Required backup/recovery artefacts are present."
        : "One or more required artefacts are missing.",
    },
    {
      id: "scope.platform-postgres",
      title: "Drill scoped to platform PostgreSQL only",
      status: "pass",
      detail:
        "Dry-run confirms scope is platform PostgreSQL only (engines/Email/FIN out of scope).",
    },
    {
      id: "marker.write",
      title: "Write restore-verification marker",
      status: "skip",
      detail: "Skipped in dry-run (no database mutation).",
    },
    {
      id: "backup.create",
      title: "Create logical backup (pg_dump)",
      status: "skip",
      detail: "Skipped in dry-run (no pg_dump).",
    },
    {
      id: "restore.apply",
      title: "Restore backup into drill database",
      status: "skip",
      detail: "Skipped in dry-run (no restore).",
    },
    {
      id: "marker.verify",
      title: "Verify marker after restore",
      status: "skip",
      detail: "Skipped in dry-run (no verification query).",
    },
    {
      id: "evidence.write",
      title: "Persist recovery evidence record",
      status: artefactsOk ? "pass" : "fail",
      detail: artefactsOk
        ? "Evidence directory ready for persistence."
        : "Evidence directory missing.",
    },
  ];

  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    programmeId: "APZHUB-1.2-002",
    backlogItemId: "R12-OPS-01",
    riskId: "OPS-R-04",
    mode: "dry-run",
    executedAt,
    environment: input.environment,
    target: {
      dataClass: "platform-postgresql",
      databaseName: "apzhub_restore_drill",
    },
    steps,
    verdict: evaluateBackupRestoreDrillVerdict(steps),
    notes: [
      "Dry-run validates procedure readiness only.",
      "Live drill required for Production restore confidence.",
    ],
    artefactPaths: [...BACKUP_RESTORE_DRILL_REQUIRED_ARTEFACTS],
  };
}

export function isRestoreDrillEvidenceCurrent(input: {
  readonly evidence: BackupRestoreRecoveryEvidence;
  readonly now?: Date;
  readonly maxAgeDays?: number;
}): boolean {
  const maxAgeDays = input.maxAgeDays ?? 90;
  const now = input.now ?? new Date();
  if (input.evidence.verdict !== "PASS") return false;
  if (input.evidence.mode !== "live") return false;
  const executed = Date.parse(input.evidence.executedAt);
  if (Number.isNaN(executed)) return false;
  const ageMs = now.getTime() - executed;
  return ageMs >= 0 && ageMs <= maxAgeDays * 24 * 60 * 60 * 1000;
}
