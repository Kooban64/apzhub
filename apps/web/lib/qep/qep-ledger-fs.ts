/**
 * Flagship hardening — shared file-backed ledger root under apps/web/.data.
 * Sync IO keeps existing store APIs synchronous. Disabled under Vitest.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

export function isQepLedgerPersistEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.APZHUB_QEP_LEDGER_PERSIST === "true") return true;
  if (env.APZHUB_QEP_LEDGER_PERSIST === "false") return false;
  if (env.VITEST === "true" || env.NODE_ENV === "test") return false;
  return true;
}

export function resolveQepDataRoot(
  segment: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const override = env.APZHUB_QEP_DATA_DIR?.trim();
  const cwd = process.cwd();
  const base = override
    ? override
    : cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, segment);
}

function safeName(id: string): string {
  return id.replace(/[^a-zA-Z0-9._:-]/g, "_");
}

export function readJsonLedgerFile<T>(dir: string, id: string): T | undefined {
  const path = join(dir, `${safeName(id)}.json`);
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return undefined;
  }
}

export function writeJsonLedgerFile(dir: string, id: string, value: unknown): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${safeName(id)}.json`),
    JSON.stringify(value, null, 2),
    "utf8",
  );
}

export function writeJsonLedgerSnapshot(
  dir: string,
  filename: string,
  value: unknown,
): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), JSON.stringify(value, null, 2), "utf8");
}

export function readJsonLedgerSnapshot<T>(
  dir: string,
  filename: string,
): T | undefined {
  const path = join(dir, filename);
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return undefined;
  }
}

export function listJsonLedgerFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith(".json"));
}
