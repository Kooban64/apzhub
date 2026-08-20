/**
 * Optional GMP pull → simplified artefact (SPR-FULL-002-B).
 * Env-gated; never auto-ingests into engagements without operator action.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  fetchGmpResults,
  resolveGmpConfigFromEnv,
  toGreenboneSimplifiedArtefact,
} from "@apzhub/integration-greenbone";

import { greenboneArtefactRoot } from "@/lib/apzpen/greenbone-artefact";

import type { EnvVars } from "@/lib/env-vars";
export async function pullGreenboneGmpToArtefact(input?: {
  readonly env?: EnvVars;
  readonly filter?: string;
}): Promise<{
  readonly ok: boolean;
  readonly detail: string;
  readonly artefactPath?: string;
  readonly findingCount?: number;
}> {
  const env = input?.env ?? process.env;
  if (env.APZPEN_GREENBONE_GMP_PULL?.trim().toLowerCase() !== "true") {
    return {
      ok: false,
      detail: "Set APZPEN_GREENBONE_GMP_PULL=true to enable GMP pull",
    };
  }
  const config = resolveGmpConfigFromEnv(env);
  if (!config) {
    return {
      ok: false,
      detail:
        "Missing GREENBONE_GMP_HOST / GREENBONE_GMP_USER / GREENBONE_GMP_PASSWORD",
    };
  }
  const findings = await fetchGmpResults(config, { filter: input?.filter });
  const artefact = toGreenboneSimplifiedArtefact(findings);
  const dir = greenboneArtefactRoot();
  await mkdir(dir, { recursive: true });
  const fileName = `gmp-pull-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const artefactPath = path.join(dir, fileName);
  await writeFile(artefactPath, `${JSON.stringify(artefact, null, 2)}\n`, "utf8");
  return {
    ok: true,
    detail: `Wrote ${findings.length} finding(s) to artefact (operator must ingest)`,
    artefactPath,
    findingCount: findings.length,
  };
}
