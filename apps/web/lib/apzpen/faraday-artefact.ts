/**
 * Safe Faraday VA artefact discovery under apztools security out.
 * Paths are confined to `{APZTOOLS_ROOT|~/apztools}/security/out/faraday`.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve, sep } from "node:path";

export type FaradayArtefactRef = {
  readonly path: string;
  readonly mtime: string;
};

const FINDINGS_EXACT = "faraday-findings.json";
const FINDINGS_SUFFIX = "-findings.json";
const VULNS_EXACT = "vulns.json";

export function resolveApztoolsRootForFaraday(): string {
  return process.env.APZTOOLS_ROOT?.trim() || join(homedir(), "apztools");
}

export function faradayArtefactRoot(): string {
  return resolve(join(resolveApztoolsRootForFaraday(), "security", "out", "faraday"));
}

/** True when candidate resolves inside root (no path traversal). */
export function isPathUnderFaradayRoot(
  candidate: string,
  root = faradayArtefactRoot(),
): boolean {
  const resolvedRoot = resolve(root);
  const resolved = resolve(candidate);
  return resolved === resolvedRoot || resolved.startsWith(resolvedRoot + sep);
}

function assertUnderFaradayRoot(candidate: string): string {
  const resolved = resolve(candidate);
  if (!isPathUnderFaradayRoot(resolved)) {
    throw new Error("Faraday artefact path must be under security/out/faraday");
  }
  return resolved;
}

function isFindingsFileName(name: string): boolean {
  return (
    name === FINDINGS_EXACT || name === VULNS_EXACT || name.endsWith(FINDINGS_SUFFIX)
  );
}

function walkFindingsFiles(dir: string, acc: FaradayArtefactRef[]): void {
  if (!existsSync(dir)) return;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (!isPathUnderFaradayRoot(full)) continue;
    if (entry.isDirectory()) {
      walkFindingsFiles(full, acc);
      continue;
    }
    if (!entry.isFile() || !isFindingsFileName(entry.name)) continue;
    try {
      const st = statSync(full);
      acc.push({
        path: full,
        mtime: st.mtime.toISOString(),
      });
    } catch {
      // skip unreadable
    }
  }
}

/**
 * List latest Faraday findings artefacts under the out root.
 * Matches `faraday-findings.json`, `*-findings.json`, or `vulns.json`, newest first.
 */
export function listLatestFaradayArtefacts(limit = 20): readonly FaradayArtefactRef[] {
  const root = faradayArtefactRoot();
  const found: FaradayArtefactRef[] = [];
  walkFindingsFiles(root, found);
  found.sort((a, b) => (a.mtime < b.mtime ? 1 : a.mtime > b.mtime ? -1 : 0));
  const capped = Math.max(0, Math.min(limit, 100));
  return found.slice(0, capped);
}

/** Read and parse a Faraday artefact JSON file (path must be under out root). */
export function readFaradayArtefact(path: string): unknown {
  const safe = assertUnderFaradayRoot(path);
  if (!existsSync(safe)) {
    throw new Error(`Faraday artefact not found: ${safe}`);
  }
  const text = readFileSync(safe, "utf8");
  return JSON.parse(text) as unknown;
}

export function isFaradayArtefactIngestEnabled(): boolean {
  return process.env.APZPEN_FARADAY_ARTEFACT_INGEST?.trim() === "true";
}
