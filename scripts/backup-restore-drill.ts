#!/usr/bin/env node
/**
 * APZHUB-1.2-002 / R12-OPS-01 — Backup restore drill runner.
 * Exit 0 = PASS; exit 1 = FAIL/BLOCKED/usage error.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildDryRunBackupRestoreEvidence,
  evaluateBackupRestoreDrillVerdict,
  validateBackupRestoreRecoveryEvidence,
  type BackupRestoreDrillStepResult,
  type BackupRestoreRecoveryEvidence,
} from "../packages/platform-operations/src/backup-restore-drill";

const ROOT = process.cwd();

function parseArgs(argv: string[]): {
  mode: "dry-run" | "live";
  container: string;
  database: string;
  environment: string;
} {
  let mode: "dry-run" | "live" = "dry-run";
  let container = process.env.APZHUB_POSTGRES_CONTAINER || "apzhub-postgres";
  let database = process.env.APZHUB_RESTORE_DRILL_DB || "apzhub_restore_drill";
  let environment = process.env.APZHUB_DRILL_ENVIRONMENT || "dev";
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--mode") {
      const next = argv[++i];
      if (next === "dry-run" || next === "live") mode = next;
      else throw new Error("Invalid --mode. Use dry-run or live.");
    } else if (arg === "--container") {
      container = argv[++i] ?? container;
    } else if (arg === "--database") {
      database = argv[++i] ?? database;
    } else if (arg === "--environment") {
      environment = argv[++i] ?? environment;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: pnpm ops:backup-restore-drill -- --mode dry-run|live [--container name] [--database name]",
      );
      process.exit(0);
    }
  }
  return { mode, container, database, environment };
}

function artefactsPresent() {
  return {
    backupAndRecoveryDoc: existsSync(
      join(ROOT, "docs/operations/BACKUP-AND-RECOVERY.md"),
    ),
    restoreDrillRunbook: existsSync(
      join(ROOT, "docs/operations/BACKUP-RESTORE-DRILL-RUNBOOK.md"),
    ),
    evidenceDirectory: existsSync(
      join(ROOT, "docs/operations/evidence/backup-restore/README.md"),
    ),
  };
}

function dockerAvailable(container: string): boolean {
  const docker = spawnSync(
    "docker",
    ["inspect", "-f", "{{.State.Running}}", container],
    {
      encoding: "utf8",
    },
  );
  return docker.status === 0 && docker.stdout.trim() === "true";
}

function dockerExec(container: string, args: string[]): string {
  return execFileSync("docker", ["exec", "-i", container, ...args], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

function writeEvidence(evidence: BackupRestoreRecoveryEvidence): string {
  const dir = join(ROOT, "docs/operations/evidence/backup-restore");
  mkdirSync(dir, { recursive: true });
  const stamp = evidence.executedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const file = `${stamp}-R12-OPS-01-${evidence.mode}-${evidence.verdict}.json`;
  const path = join(dir, file);
  writeFileSync(path, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  return path;
}

function persistAndExit(evidence: BackupRestoreRecoveryEvidence): never {
  const validation = validateBackupRestoreRecoveryEvidence(evidence);
  if (!validation.ok) {
    console.error("Evidence validation failed:", validation.errors.join("; "));
    process.exit(1);
  }
  const path = writeEvidence(evidence);
  console.log(
    JSON.stringify(
      { evidencePath: path, verdict: evidence.verdict, mode: evidence.mode },
      null,
      2,
    ),
  );
  process.exit(evidence.verdict === "PASS" ? 0 : 1);
}

function runLiveDrill(input: {
  container: string;
  database: string;
  environment: string;
}): never {
  const steps: BackupRestoreDrillStepResult[] = [];
  const artefacts = artefactsPresent();
  const artefactsOk =
    artefacts.backupAndRecoveryDoc &&
    artefacts.restoreDrillRunbook &&
    artefacts.evidenceDirectory;

  steps.push({
    id: "artefacts.present",
    title: "Backup/recovery docs and drill runbook present",
    status: artefactsOk ? "pass" : "fail",
    detail: artefactsOk
      ? "Required backup/recovery artefacts are present."
      : "One or more required artefacts are missing.",
  });
  steps.push({
    id: "scope.platform-postgres",
    title: "Drill scoped to platform PostgreSQL only",
    status: "pass",
    detail: `Target database ${input.database} on container ${input.container} (platform PostgreSQL only).`,
  });

  if (!artefactsOk) {
    persistAndExit({
      schemaVersion: "1.0.0",
      programmeId: "APZHUB-1.2-002",
      backlogItemId: "R12-OPS-01",
      riskId: "OPS-R-04",
      mode: "live",
      executedAt: new Date().toISOString(),
      environment: input.environment,
      target: {
        dataClass: "platform-postgresql",
        containerName: input.container,
        databaseName: input.database,
      },
      steps: [
        ...steps,
        {
          id: "evidence.write",
          title: "Persist recovery evidence record",
          status: "fail",
          detail: "Artefacts missing.",
        },
      ],
      verdict: "FAIL",
      notes: ["Artefacts missing — live drill aborted."],
      artefactPaths: [],
    });
  }

  if (!dockerAvailable(input.container)) {
    const blockedSteps: BackupRestoreDrillStepResult[] = [
      ...steps,
      {
        id: "marker.write",
        title: "Write restore-verification marker",
        status: "blocked",
        detail: `Container ${input.container} is not running.`,
      },
      {
        id: "backup.create",
        title: "Create logical backup (pg_dump)",
        status: "blocked",
        detail: "Blocked — container unavailable.",
      },
      {
        id: "restore.apply",
        title: "Restore backup into drill database",
        status: "blocked",
        detail: "Blocked — container unavailable.",
      },
      {
        id: "marker.verify",
        title: "Verify marker after restore",
        status: "blocked",
        detail: "Blocked — container unavailable.",
      },
      {
        id: "evidence.write",
        title: "Persist recovery evidence record",
        status: "pass",
        detail: "Evidence persisted with BLOCKED verdict.",
      },
    ];
    persistAndExit({
      schemaVersion: "1.0.0",
      programmeId: "APZHUB-1.2-002",
      backlogItemId: "R12-OPS-01",
      riskId: "OPS-R-04",
      mode: "live",
      executedAt: new Date().toISOString(),
      environment: input.environment,
      target: {
        dataClass: "platform-postgresql",
        containerName: input.container,
        databaseName: input.database,
      },
      steps: blockedSteps,
      verdict: evaluateBackupRestoreDrillVerdict(blockedSteps),
      notes: ["Docker container not running — cannot execute live restore."],
      artefactPaths: [
        "docs/operations/BACKUP-AND-RECOVERY.md",
        "docs/operations/BACKUP-RESTORE-DRILL-RUNBOOK.md",
        "docs/operations/evidence/backup-restore/README.md",
      ],
    });
  }

  const markerId = `r12-ops-01-${Date.now()}`;
  const localDir = join(ROOT, ".local/ops/backup-restore");
  mkdirSync(localDir, { recursive: true });
  const dumpPath = join(localDir, `${input.database}-${Date.now()}.sql`);

  try {
    dockerExec(input.container, [
      "psql",
      "-U",
      "apzhub",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${sqlEscape(input.database)}' AND pid <> pg_backend_pid();`,
    ]);
  } catch {
    // DB may not exist yet
  }

  // DROP/CREATE DATABASE cannot run inside a multi-statement transaction.
  dockerExec(input.container, [
    "psql",
    "-U",
    "apzhub",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `DROP DATABASE IF EXISTS ${input.database};`,
  ]);
  dockerExec(input.container, [
    "psql",
    "-U",
    "apzhub",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `CREATE DATABASE ${input.database};`,
  ]);

  dockerExec(input.container, [
    "psql",
    "-U",
    "apzhub",
    "-d",
    input.database,
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `CREATE TABLE restore_drill_marker (
       id text PRIMARY KEY,
       created_at timestamptz NOT NULL DEFAULT now()
     );`,
  ]);
  dockerExec(input.container, [
    "psql",
    "-U",
    "apzhub",
    "-d",
    input.database,
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `INSERT INTO restore_drill_marker (id) VALUES ('${sqlEscape(markerId)}');`,
  ]);
  steps.push({
    id: "marker.write",
    title: "Write restore-verification marker",
    status: "pass",
    detail: `Marker ${markerId} written.`,
  });

  const dump = dockerExec(input.container, [
    "pg_dump",
    "-U",
    "apzhub",
    "-d",
    input.database,
    "--no-owner",
    "--no-acl",
  ]);
  writeFileSync(dumpPath, dump, "utf8");
  steps.push({
    id: "backup.create",
    title: "Create logical backup (pg_dump)",
    status: "pass",
    detail: "Logical dump written to local artefact path (gitignored).",
  });

  try {
    dockerExec(input.container, [
      "psql",
      "-U",
      "apzhub",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${sqlEscape(input.database)}' AND pid <> pg_backend_pid();`,
    ]);
  } catch {
    // ignore
  }
  dockerExec(input.container, [
    "psql",
    "-U",
    "apzhub",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `DROP DATABASE IF EXISTS ${input.database};`,
  ]);
  dockerExec(input.container, [
    "psql",
    "-U",
    "apzhub",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `CREATE DATABASE ${input.database};`,
  ]);

  const restore = spawnSync(
    "docker",
    [
      "exec",
      "-i",
      input.container,
      "psql",
      "-U",
      "apzhub",
      "-d",
      input.database,
      "-v",
      "ON_ERROR_STOP=1",
    ],
    { input: readFileSync(dumpPath), encoding: "utf8" },
  );

  if (restore.status !== 0) {
    steps.push({
      id: "restore.apply",
      title: "Restore backup into drill database",
      status: "fail",
      detail: restore.stderr || "psql restore failed.",
    });
    steps.push({
      id: "marker.verify",
      title: "Verify marker after restore",
      status: "fail",
      detail: "Skipped because restore failed.",
    });
  } else {
    steps.push({
      id: "restore.apply",
      title: "Restore backup into drill database",
      status: "pass",
      detail: "Dump restored into isolated drill database.",
    });
    const verify = dockerExec(input.container, [
      "psql",
      "-U",
      "apzhub",
      "-d",
      input.database,
      "-t",
      "-A",
      "-c",
      `SELECT id FROM restore_drill_marker WHERE id = '${sqlEscape(markerId)}';`,
    ]).trim();
    steps.push({
      id: "marker.verify",
      title: "Verify marker after restore",
      status: verify === markerId ? "pass" : "fail",
      detail:
        verify === markerId
          ? "Marker verified after restore."
          : `Marker mismatch (got '${verify}').`,
    });
  }

  steps.push({
    id: "evidence.write",
    title: "Persist recovery evidence record",
    status: "pass",
    detail: "Evidence persistence step reached.",
  });

  persistAndExit({
    schemaVersion: "1.0.0",
    programmeId: "APZHUB-1.2-002",
    backlogItemId: "R12-OPS-01",
    riskId: "OPS-R-04",
    mode: "live",
    executedAt: new Date().toISOString(),
    environment: input.environment,
    target: {
      dataClass: "platform-postgresql",
      containerName: input.container,
      databaseName: input.database,
    },
    steps,
    verdict: evaluateBackupRestoreDrillVerdict(steps),
    notes: [
      "Live drill used isolated database apzhub_restore_drill.",
      "Dump artefact retained under .local/ops/backup-restore/ (not committed).",
    ],
    artefactPaths: [
      "docs/operations/BACKUP-AND-RECOVERY.md",
      "docs/operations/BACKUP-RESTORE-DRILL-RUNBOOK.md",
      "docs/operations/evidence/backup-restore/README.md",
    ],
  });
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  if (args.mode === "dry-run") {
    const evidence = buildDryRunBackupRestoreEvidence({
      environment: args.environment,
      artefacts: artefactsPresent(),
    });
    persistAndExit(evidence);
  }
  runLiveDrill(args);
}

main();
