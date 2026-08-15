/**
 * Safe Greenbone VA artefact discovery under apztools security out.
 * Paths are confined to `{APZTOOLS_ROOT|~/apztools}/security/out/greenbone`.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve, sep } from "node:path";

export type GreenboneArtefactRef = {
  readonly path: string;
  readonly mtime: string;
};

const FINDINGS_EXACT = "greenbone-findings.json";
const FINDINGS_SUFFIX = "-findings.json";

export function resolveApztoolsRootForGreenbone(): string {
  return process.env.APZTOOLS_ROOT?.trim() || join(homedir(), "apztools");
}

export function greenboneArtefactRoot(): string {
  return resolve(
    join(resolveApztoolsRootForGreenbone(), "security", "out", "greenbone"),
  );
}

/** True when candidate resolves inside root (no path traversal). */
export function isPathUnderGreenboneRoot(
  candidate: string,
  root = greenboneArtefactRoot(),
): boolean {
  const resolvedRoot = resolve(root);
  const resolved = resolve(candidate);
  return resolved === resolvedRoot || resolved.startsWith(resolvedRoot + sep);
}

function assertUnderGreenboneRoot(candidate: string): string {
  const resolved = resolve(candidate);
  if (!isPathUnderGreenboneRoot(resolved)) {
    throw new Error("Greenbone artefact path must be under security/out/greenbone");
  }
  return resolved;
}

function isFindingsFileName(name: string): boolean {
  return name === FINDINGS_EXACT || name.endsWith(FINDINGS_SUFFIX);
}

function walkFindingsFiles(dir: string, acc: GreenboneArtefactRef[]): void {
  if (!existsSync(dir)) return;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (!isPathUnderGreenboneRoot(full)) continue;
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
 * List latest Greenbone findings artefacts under the out root.
 * Matches `greenbone-findings.json` or `*-findings.json`, newest first.
 */
export function listLatestGreenboneArtefacts(
  limit = 20,
): readonly GreenboneArtefactRef[] {
  const root = greenboneArtefactRoot();
  const found: GreenboneArtefactRef[] = [];
  walkFindingsFiles(root, found);
  found.sort((a, b) => (a.mtime < b.mtime ? 1 : a.mtime > b.mtime ? -1 : 0));
  const capped = Math.max(0, Math.min(limit, 100));
  return found.slice(0, capped);
}

/** Read and parse a Greenbone artefact JSON file (path must be under out root). */
export function readGreenboneArtefact(path: string): unknown {
  const safe = assertUnderGreenboneRoot(path);
  if (!existsSync(safe)) {
    throw new Error(`Greenbone artefact not found: ${safe}`);
  }
  const text = readFileSync(safe, "utf8");
  return JSON.parse(text) as unknown;
}

export function isGreenboneArtefactIngestEnabled(): boolean {
  return process.env.APZPEN_GREENBONE_ARTEFACT_INGEST?.trim() === "true";
}
