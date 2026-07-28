#!/usr/bin/env node
/**
 * APZHUB-ENG-0005 / R12-QA-01 — Portfolio Playwright + Docker re-cert path.
 * Exit 0 = PASS; exit 1 = FAIL/BLOCKED.
 *
 * Modes:
 *   --mode path         Artefact + CI wiring checks only (default)
 *   --mode docker       path + compose config + APZHUB service health (up if needed)
 *   --mode playwright   path + full pnpm test:e2e
 *   --mode full         docker + playwright
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditPortfolioRecert,
  validatePortfolioRecertEvidence,
  type PortfolioRecertArtefactsPresent,
  type PortfolioRecertDockerResult,
  type PortfolioRecertMode,
  type PortfolioRecertPlaywrightResult,
} from "../packages/platform-operations/src/portfolio-recert";

const ROOT = process.cwd();
const COMPOSE = join(ROOT, "infrastructure/docker/docker-compose.dev.yml");
const EVIDENCE_DIR = join(ROOT, "docs/operations/evidence/portfolio-recert");

function parseMode(argv: string[]): PortfolioRecertMode {
  const idx = argv.indexOf("--mode");
  const raw = idx >= 0 ? argv[idx + 1] : "path";
  if (raw === "path" || raw === "docker" || raw === "playwright" || raw === "full") {
    return raw;
  }
  console.error(`Unknown mode: ${String(raw)}`);
  process.exit(1);
}

function detectArtefacts(): PortfolioRecertArtefactsPresent {
  const packageJson = readFileSync(join(ROOT, "package.json"), "utf8");
  const ciYml = existsSync(join(ROOT, ".github/workflows/ci.yml"))
    ? readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8")
    : "";
  return {
    composeFile: existsSync(COMPOSE),
    playwrightConfig: existsSync(join(ROOT, "testing/playwright/playwright.config.ts")),
    ciWorkflow: existsSync(join(ROOT, ".github/workflows/ci.yml")),
    ciRunsPlaywright: /pnpm test:e2e/.test(ciYml),
    runbook: existsSync(
      join(ROOT, "docs/operations/PORTFOLIO-PLAYWRIGHT-DOCKER-RECERT.md"),
    ),
    evidenceDirectory: existsSync(join(EVIDENCE_DIR, "README.md")),
    packageScript: /"ops:portfolio-recert"/.test(packageJson),
  };
}

function runCompose(args: string[]): { ok: boolean; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync("docker", ["compose", "-f", COMPOSE, ...args], {
      encoding: "utf8",
      cwd: ROOT,
    });
    return { ok: true, stdout, stderr: "" };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? err.message ?? "compose failed",
    };
  }
}

function dockerStage(bringUp: boolean): PortfolioRecertDockerResult {
  const notes: string[] = [];
  const config = runCompose(["config", "--quiet"]);
  if (!config.ok) {
    return {
      composeConfigOk: false,
      servicesHealthy: false,
      serviceNames: [],
      notes: [`compose config failed: ${config.stderr.trim() || config.stdout.trim()}`],
    };
  }
  notes.push("docker compose config --quiet OK");

  if (bringUp) {
    const up = runCompose(["up", "-d", "--pull", "missing"]);
    if (!up.ok) {
      return {
        composeConfigOk: true,
        servicesHealthy: false,
        serviceNames: [],
        notes: [...notes, `compose up failed: ${up.stderr.trim() || up.stdout.trim()}`],
      };
    }
    notes.push("compose up -d completed");
  }

  const ps = runCompose(["ps", "--format", "json"]);
  const serviceNames: string[] = [];
  let healthy = 0;
  let total = 0;
  if (ps.ok && ps.stdout.trim()) {
    for (const line of ps.stdout.split("\n")) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line) as {
          Name?: string;
          Service?: string;
          Health?: string;
          State?: string;
        };
        const name = row.Name ?? row.Service ?? "unknown";
        serviceNames.push(name);
        total += 1;
        const health = (row.Health ?? "").toLowerCase();
        const state = (row.State ?? "").toLowerCase();
        if (health === "healthy" || (health === "" && state === "running")) {
          healthy += 1;
        }
      } catch {
        // ignore non-json lines
      }
    }
  }

  // Fallback: docker ps by container name prefix
  if (total === 0) {
    try {
      const out = execFileSync(
        "docker",
        ["ps", "--filter", "name=apzhub-", "--format", "{{.Names}}\t{{.Status}}"],
        { encoding: "utf8" },
      );
      for (const line of out.split("\n")) {
        if (!line.trim()) continue;
        const [name, status = ""] = line.split("\t");
        if (!name) continue;
        serviceNames.push(name);
        total += 1;
        if (/healthy|Up /i.test(status)) healthy += 1;
      }
      notes.push("health inspected via docker ps name=apzhub-");
    } catch {
      notes.push("unable to inspect docker ps");
    }
  }

  const servicesHealthy = total > 0 && healthy === total;
  if (!servicesHealthy) {
    notes.push(
      `expected all APZHUB compose services healthy; healthy=${healthy}/${total}`,
    );
  }

  return {
    composeConfigOk: true,
    servicesHealthy,
    serviceNames,
    notes,
  };
}

function playwrightStage(): PortfolioRecertPlaywrightResult {
  const notes = ["Invoking pnpm test:e2e (full monorepo Playwright chromium suite)"];
  const result = spawnSync("pnpm", ["test:e2e"], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, CI: process.env.CI ?? "true" },
    stdio: "inherit",
  });
  if (result.error) {
    return {
      executed: false,
      exitCode: null,
      skipped: true,
      skipReason: `environment: ${result.error.message}`,
      suite: "none",
      notes,
    };
  }
  return {
    executed: true,
    exitCode: result.status ?? 1,
    skipped: false,
    suite: "full",
    notes,
  };
}

function main(): void {
  const mode = parseMode(process.argv.slice(2));
  const artefacts = detectArtefacts();
  const needsDocker = mode === "docker" || mode === "full";
  const needsPlaywright = mode === "playwright" || mode === "full";

  const docker = needsDocker ? dockerStage(true) : null;
  const playwright = needsPlaywright ? playwrightStage() : null;

  const evidence = auditPortfolioRecert({
    mode,
    artefacts,
    docker,
    playwright,
    environment: process.env.APZHUB_RECERT_ENVIRONMENT || "dev",
  });

  const validation = validatePortfolioRecertEvidence(evidence);
  if (!validation.ok) {
    console.error("Evidence validation failed:", validation.errors.join("; "));
    process.exit(1);
  }

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const stamp = evidence.executedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const file = `${stamp}-R12-QA-01-${mode}-${evidence.verdict}.json`;
  const path = join(EVIDENCE_DIR, file);
  writeFileSync(path, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        evidencePath: path,
        verdict: evidence.verdict,
        mode,
        findingCount: evidence.findings.length,
        failCount: evidence.findings.filter((f) => f.severity === "fail").length,
      },
      null,
      2,
    ),
  );
  process.exit(evidence.verdict === "PASS" ? 0 : 1);
}

main();
