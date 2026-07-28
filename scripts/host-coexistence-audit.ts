#!/usr/bin/env node
/**
 * APZHUB-1.2-004 / R12-OPS-03 — Host coexistence capacity audit.
 * Exit 0 = PASS; exit 1 = FAIL.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  APZHUB_RESERVED_HOST_PORTS,
  auditHostCoexistence,
  validateHostCoexistenceAuditEvidence,
} from "../packages/platform-operations/src/host-coexistence";

const ROOT = process.cwd();

function parseArgs(argv: string[]): { live: boolean } {
  return { live: argv.includes("--live") };
}

function detectLiveConflicts(): { port: number; occupant: string }[] {
  const conflicts: { port: number; occupant: string }[] = [];
  const reserved = new Set(APZHUB_RESERVED_HOST_PORTS.map((p) => p.hostPort));

  let output = "";
  try {
    output = execFileSync("docker", ["ps", "--format", "{{.Names}}\t{{.Ports}}"], {
      encoding: "utf8",
    });
  } catch {
    return conflicts;
  }

  for (const line of output.split("\n")) {
    if (!line.trim()) continue;
    const [name, portsField = ""] = line.split("\t");
    if (!name) continue;
    const isApzhub = name.startsWith("apzhub-");
    for (const match of portsField.matchAll(
      /(?:0\.0\.0\.0|127\.0\.0\.1|:::)?(\d{2,5})->/g,
    )) {
      const port = Number(match[1]);
      if (!reserved.has(port)) continue;
      if (!isApzhub) {
        conflicts.push({ port, occupant: name });
      }
    }
  }
  return conflicts;
}

function main(): void {
  const { live } = parseArgs(process.argv.slice(2));
  const composePath = join(ROOT, "infrastructure/docker/docker-compose.dev.yml");
  const composeYaml = existsSync(composePath) ? readFileSync(composePath, "utf8") : "";

  const evidence = auditHostCoexistence({
    composeYaml,
    artefactsPresent: {
      environmentDoc: existsSync(join(ROOT, "ENVIRONMENT.md")),
      capacityPlanningDoc: existsSync(
        join(ROOT, "docs/operations/CAPACITY-PLANNING.md"),
      ),
      coexistenceControlsDoc: existsSync(
        join(ROOT, "docs/operations/HOST-COEXISTENCE-CONTROLS.md"),
      ),
      composeFile: existsSync(composePath),
      evidenceDirectory: existsSync(
        join(ROOT, "docs/operations/evidence/host-coexistence/README.md"),
      ),
    },
    liveConflicts: live ? detectLiveConflicts() : [],
    environment: process.env.APZHUB_DRILL_ENVIRONMENT || "dev",
  });

  const validation = validateHostCoexistenceAuditEvidence(evidence);
  if (!validation.ok) {
    console.error("Evidence validation failed:", validation.errors.join("; "));
    process.exit(1);
  }

  const dir = join(ROOT, "docs/operations/evidence/host-coexistence");
  mkdirSync(dir, { recursive: true });
  const stamp = evidence.executedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const file = `${stamp}-R12-OPS-03-audit-${evidence.verdict}.json`;
  const path = join(dir, file);
  writeFileSync(path, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        evidencePath: path,
        verdict: evidence.verdict,
        composePorts: evidence.composePorts,
        live,
        findingCount: evidence.findings.length,
      },
      null,
      2,
    ),
  );
  process.exit(evidence.verdict === "PASS" ? 0 : 1);
}

main();
