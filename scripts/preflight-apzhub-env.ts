/**
 * Validates common server-side env pairs before deploy / docker build.
 * Load the same `.env` your compose build uses: `tsx scripts/preflight-apzhub-env.ts path/to/.env`
 * or set `APZHUB_PREFLIGHT_ENV_FILE` and run without args.
 *
 * Exits 0 when checks pass or when stack is clearly mock-only (nothing to validate).
 */
import { existsSync, readFileSync } from "node:fs";

type AdapterSource = "mock" | "file" | "real";

function readSource(raw: string | undefined, fallback: AdapterSource): AdapterSource {
  const v = (raw ?? "").toLowerCase().trim();
  if (v === "file" || v === "real" || v === "mock") {
    return v;
  }
  return fallback;
}

function parseEnvFile(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function mergedEnv(): NodeJS.ProcessEnv {
  const pathFromArg = process.argv[2]?.trim();
  const pathFromEnv = (process.env.APZHUB_PREFLIGHT_ENV_FILE ?? "").trim();
  const file = pathFromArg || pathFromEnv;
  if (!file) {
    return process.env;
  }
  if (!existsSync(file)) {
    console.error(`[preflight] env file not found: ${file}`);
    process.exit(1);
  }
  const parsed = parseEnvFile(readFileSync(file, "utf8"));
  return { ...process.env, ...parsed };
}

function hasLaunchJwtConfigured(e: NodeJS.ProcessEnv): boolean {
  if ((e.APZHUB_LAUNCH_JWT_SIGNING_SECRET ?? "").trim()) {
    return true;
  }
  const p = (e.APZHUB_LAUNCH_JWT_SIGNING_SECRET_FILE ?? "").trim();
  if (!p || !existsSync(p)) {
    return false;
  }
  try {
    return readFileSync(p, "utf8").trim().length > 0;
  } catch {
    return false;
  }
}

function main() {
  const e = mergedEnv();
  const access = readSource(e.APZHUB_ACCESS_SOURCE, "mock");
  const launch = readSource(e.APZHUB_LAUNCH_SOURCE, "mock");
  const provisioning = readSource(e.APZHUB_PROVISIONING_SOURCE, "mock");
  const errors: string[] = [];
  const warnings: string[] = [];

  if (access === "real") {
    const pub = (e.NEXT_PUBLIC_APZHUB_ACCESS_SOURCE ?? "mock").toLowerCase().trim();
    if (pub === "mock") {
      errors.push(
        "APZHUB_ACCESS_SOURCE=real but NEXT_PUBLIC_APZHUB_ACCESS_SOURCE is mock (or unset). Workspace tiles use mock posture for portal UUIDs — set NEXT_PUBLIC_APZHUB_ACCESS_SOURCE=real and rebuild web.",
      );
    }
    if (provisioning === "real" && (e.APZHUB_ACCESS_OPTIMISTIC_REALIZATION ?? "").toLowerCase().trim() !== "true") {
      warnings.push(
        "APZHUB_ACCESS_OPTIMISTIC_REALIZATION is not true while access and provisioning are real — launches stay deferred until realization is provisioned (run worker or enable optimistic realization on staging).",
      );
    }
  }

  if (launch === "real") {
    const pubLaunch = (e.NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE ?? "mock").toLowerCase().trim();
    if (pubLaunch === "mock") {
      errors.push(
        "APZHUB_LAUNCH_SOURCE=real but NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE is mock (or unset). Client transport may target mock routes — align and rebuild web.",
      );
    }
    if (!hasLaunchJwtConfigured(e)) {
      errors.push(
        "APZHUB_LAUNCH_SOURCE=real but no JWT signing material found (set APZHUB_LAUNCH_JWT_SIGNING_SECRET or a readable APZHUB_LAUNCH_JWT_SIGNING_SECRET_FILE).",
      );
    }
  }

  for (const w of warnings) {
    console.warn(`[preflight] WARN: ${w}`);
  }
  if (errors.length) {
    for (const err of errors) {
      console.error(`[preflight] ERROR: ${err}`);
    }
    process.exit(1);
  }

  if (access !== "real" && launch !== "real") {
    console.log("[preflight] access and launch are not both real — strict NEXT_PUBLIC / JWT checks skipped.");
  } else {
    console.log("[preflight] deployment env checks passed.");
  }
}

main();
