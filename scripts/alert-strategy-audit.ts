#!/usr/bin/env node
/**
 * APZHUB-1.2-003 / R12-OPS-02 — Alert strategy audit runner.
 * Exit 0 = PASS; exit 1 = FAIL.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  PLATFORM_ALERT_POLICIES,
  auditAlertStrategy,
  validateAlertStrategyAuditEvidence,
} from "../packages/platform-operations/src/alert-strategy";

const ROOT = process.cwd();

function existingRunbookPaths(): Set<string> {
  const dir = join(ROOT, "docs/operations/runbooks");
  const set = new Set<string>();
  if (!existsSync(dir)) return set;
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith(".md") && entry !== "README.md") {
      set.add(`docs/operations/runbooks/${entry}`);
    }
  }
  return set;
}

function main(): void {
  const evidence = auditAlertStrategy({
    policies: PLATFORM_ALERT_POLICIES,
    existingRunbookPaths: existingRunbookPaths(),
    artefactsPresent: {
      monitoringDoc: existsSync(
        join(ROOT, "docs/operations/MONITORING-AND-ALERTING.md"),
      ),
      runbookStandards: existsSync(join(ROOT, "docs/operations/RUNBOOK-STANDARDS.md")),
      runbooksIndex: existsSync(join(ROOT, "docs/operations/runbooks/README.md")),
      evidenceDirectory: existsSync(
        join(ROOT, "docs/operations/evidence/alert-strategy/README.md"),
      ),
    },
    environment: process.env.APZHUB_DRILL_ENVIRONMENT || "dev",
  });

  const validation = validateAlertStrategyAuditEvidence(evidence);
  if (!validation.ok) {
    console.error("Evidence validation failed:", validation.errors.join("; "));
    process.exit(1);
  }

  const dir = join(ROOT, "docs/operations/evidence/alert-strategy");
  mkdirSync(dir, { recursive: true });
  const stamp = evidence.executedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const file = `${stamp}-R12-OPS-02-audit-${evidence.verdict}.json`;
  const path = join(dir, file);
  writeFileSync(path, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        evidencePath: path,
        verdict: evidence.verdict,
        policyCount: evidence.policyCount,
        findingCount: evidence.findings.length,
      },
      null,
      2,
    ),
  );
  process.exit(evidence.verdict === "PASS" ? 0 : 1);
}

main();
