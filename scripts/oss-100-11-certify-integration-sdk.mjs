#!/usr/bin/env node
/**
 * OSS-100-11 — pnpm certify:integration-sdk
 * Single certification result for Integration SDK v1.0.0 wave freeze.
 * Composes: architecture/dependency/boundary/compatibility/provider/docs audits,
 * regression suite, scoped coverage. No new adapter functionality.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/** @type {{ name: string; result: "PASS" | "FAIL" | "LIMITED"; detail?: string }[]} */
const gates = [];

function runNode(script, name) {
  const full = join(ROOT, script);
  if (!existsSync(full)) {
    gates.push({ name, result: "FAIL", detail: `Missing ${script}` });
    return false;
  }
  try {
    execFileSync(process.execPath, [full], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    gates.push({ name, result: "PASS" });
    return true;
  } catch (err) {
    const stderr = err.stderr?.toString?.() ?? err.stdout?.toString?.() ?? String(err);
    gates.push({
      name,
      result: "FAIL",
      detail: stderr.split("\n").slice(0, 8).join(" | ").slice(0, 400),
    });
    return false;
  }
}

function runPnpm(args, name) {
  const result = spawnSync("pnpm", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status === 0) {
    gates.push({ name, result: "PASS" });
    return true;
  }
  const detail = [result.stdout, result.stderr]
    .filter(Boolean)
    .join("\n")
    .split("\n")
    .slice(-14)
    .join(" | ")
    .slice(0, 500);
  gates.push({ name, result: "FAIL", detail });
  return false;
}

console.log("OSS-100-11 certify:integration-sdk");
console.log("==================================\n");

let failed = false;

if (
  !runNode(
    "scripts/oss-100-11-integration-sdk-wave-audit.mjs",
    "architecture+dependency+boundary+compatibility+documentation",
  )
) {
  failed = true;
}

const typecheck = spawnSync(
  "pnpm",
  ["--filter", "@apzhub/integration-sdk", "typecheck"],
  { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);
if (typecheck.status === 0) {
  gates.push({ name: "typecheck:integration-sdk", result: "PASS" });
} else {
  gates.push({
    name: "typecheck:integration-sdk",
    result: "FAIL",
    detail: (typecheck.stderr || typecheck.stdout || "")
      .split("\n")
      .slice(-8)
      .join(" | ")
      .slice(0, 400),
  });
  failed = true;
}

const lint = spawnSync("pnpm", ["--filter", "@apzhub/integration-sdk", "lint"], {
  cwd: ROOT,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (lint.status === 0) {
  gates.push({ name: "lint:integration-sdk", result: "PASS" });
} else {
  gates.push({
    name: "lint:integration-sdk",
    result: "FAIL",
    detail: (lint.stderr || lint.stdout || "")
      .split("\n")
      .slice(-8)
      .join(" | ")
      .slice(0, 400),
  });
  failed = true;
}

const harnessArgs = [
  "exec",
  "vitest",
  "run",
  "packages/integration-sdk",
  "testing/sdk-v1",
  "integrations/plane",
  "integrations/zammad",
  "integrations/meilisearch",
  "integrations/n8n",
  "--reporter=dot",
];

if (!runPnpm(harnessArgs, "sdk+provider-regression-suite")) {
  failed = true;
}

const coverageArgs = [
  "exec",
  "vitest",
  "run",
  "packages/integration-sdk",
  "testing/sdk-v1",
  "--coverage",
  "--coverage.include=packages/integration-sdk/src/**",
  "--coverage.reporter=text-summary",
  "--reporter=dot",
];

const coverage = spawnSync("pnpm", coverageArgs, {
  cwd: ROOT,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
const coverageOut = `${coverage.stdout ?? ""}\n${coverage.stderr ?? ""}`;
const linesMatch = coverageOut.match(/Lines\s*:\s*([\d.]+)%/);
const funcsMatch = coverageOut.match(/Functions\s*:\s*([\d.]+)%/);
const branchMatch = coverageOut.match(/Branches\s*:\s*([\d.]+)%/);
const lines = linesMatch ? Number(linesMatch[1]) : NaN;
const funcs = funcsMatch ? Number(funcsMatch[1]) : NaN;
const branches = branchMatch ? Number(branchMatch[1]) : NaN;

if (coverage.status !== 0 && Number.isNaN(lines)) {
  gates.push({
    name: "scoped-sdk-coverage",
    result: "FAIL",
    detail: coverageOut.split("\n").slice(-10).join(" | ").slice(0, 500),
  });
  failed = true;
} else if (!Number.isNaN(lines) && !Number.isNaN(funcs) && lines >= 95 && funcs >= 95) {
  gates.push({
    name: "scoped-sdk-coverage",
    result: "PASS",
    detail: `lines ${lines}% · functions ${funcs}% · branches ${Number.isNaN(branches) ? "n/a" : `${branches}%`}`,
  });
} else if (!Number.isNaN(lines) && lines >= 90) {
  gates.push({
    name: "scoped-sdk-coverage",
    result: "LIMITED",
    detail: `lines ${lines}% · functions ${funcs}% · branches ${branches}% (below preferred 95% functions and/or lines)`,
  });
} else {
  gates.push({
    name: "scoped-sdk-coverage",
    result: "FAIL",
    detail: `lines ${lines}% · functions ${funcs}% · branches ${branches}%`,
  });
  failed = true;
}

const requiredDocs = [
  "docs/architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Integration-SDK-Reference-Standard.md",
  "docs/developer/APZHUB-Integration-SDK-Provider-Development-Guide.md",
  "docs/guides/APZHUB-Integration-SDK-Compatibility-Guide.md",
  "docs/guides/APZHUB-Integration-SDK-Operational-Readiness-Guide.md",
  "docs/reviews/OSS-100-11-Security-Review.md",
  "docs/reviews/OSS-100-11-Quality-Evidence.md",
  "docs/releases/APZHUB-Integration-SDK-v1.0.0-Release-Notes.md",
  "docs/sprint/OSS-100-11-completion-report.md",
  "docs/adr/ADR-0065-integration-sdk-v1-architecture-freeze.md",
];
let docsOk = true;
for (const doc of requiredDocs) {
  if (!existsSync(join(ROOT, doc))) {
    docsOk = false;
    gates.push({ name: `doc:${doc}`, result: "FAIL", detail: "missing" });
  }
}
if (docsOk) {
  gates.push({ name: "documentation-pack", result: "PASS" });
} else {
  failed = true;
}

console.log("Gate results:\n");
for (const gate of gates) {
  const suffix = gate.detail ? ` — ${gate.detail}` : "";
  console.log(`  [${gate.result}] ${gate.name}${suffix}`);
}

const blockingFail = gates.some((g) => g.result === "FAIL");
if (blockingFail || failed) {
  console.error("\nRESULT: FAIL — blocking gate failure");
  process.exit(1);
}

console.log("\nRESULT: PASS (with documented LIMITED gates where noted)");
console.log(
  "Classification: PRODUCTION_READY_WITH_LIMITATIONS · Version 1.0.0 · Architecture Frozen",
);
process.exit(0);
