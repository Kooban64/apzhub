import { existsSync, readFileSync } from "node:fs";

import "@testing-library/jest-dom/vitest";

function hasDbUrlConfigured(): boolean {
  const inline = (process.env.APZHUB_DATABASE_URL ?? process.env.DATABASE_URL ?? "").trim();
  if (inline) {
    return true;
  }
  const fp = process.env.APZHUB_DATABASE_URL_FILE?.trim();
  if (!fp) {
    return false;
  }
  try {
    return existsSync(fp) && Boolean(readFileSync(fp, "utf8").trim());
  } catch {
    return false;
  }
}

const hasDb = hasDbUrlConfigured();
if (!hasDb) {
  // eslint-disable-next-line no-console
  console.info(
    "[vitest] No APZHUB_DATABASE_URL/DATABASE_URL (or readable APZHUB_DATABASE_URL_FILE) — Postgres-backed tests in describe.skipIf(!hasDb) are skipped.",
  );
}
