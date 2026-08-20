/**
 * Flagship F12+ — self-serve verification pack dispatch for a durable change.
 * Operators trigger F10 quality + F11 security packs from the Journey UI.
 * Never auto-certifies.
 */

import { randomUUID } from "node:crypto";

import type { ScmChangeEvent } from "@apzhub/platform-scm";

import { getQepScmRuntime } from "@/lib/qep/scm-runtime";
import {
  isSecurityDispatchEnabled,
  triggerSecurityDispatchForPersistedChanges,
} from "@/lib/qep/security-dispatch-on-change";
import {
  isVerificationDispatchEnabled,
  triggerVerificationDispatchForPersistedChanges,
} from "@/lib/qep/verification-dispatch-on-change";
import type { VerificationDispatchRecord } from "@/lib/qep/verification-dispatch-store";

import type { EnvVars } from "@/lib/env-vars";
export type RunVerificationPacksResult = {
  readonly changeEventId: string;
  readonly quality: readonly VerificationDispatchRecord[];
  readonly security: readonly VerificationDispatchRecord[];
  readonly qualityEnabled: boolean;
  readonly securityEnabled: boolean;
  readonly force: boolean;
};

export async function runVerificationPacksForChange(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly packs?: readonly ("quality" | "security")[];
  readonly force?: boolean;
  readonly env?: EnvVars;
}): Promise<RunVerificationPacksResult> {
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("run_packs.change_id_required");
  }

  const env = input.env ?? process.env;
  const packs = new Set(input.packs ?? ["quality", "security"]);
  const force = input.force !== false; // self-serve defaults to force re-dispatch
  const scm = getQepScmRuntime();
  const events = await scm.listChangeEvents({
    tenantId: input.tenantId,
    limit: 500,
  });
  const match = events.find((row) => row.changeEventId === changeEventId);
  if (!match) {
    throw new Error("run_packs.change_not_found");
  }

  const resolveRepositoryFullName = async (repositoryId: string) => {
    const repo = await scm.getRepository(repositoryId);
    return repo?.fullName;
  };

  const correlationId = randomUUID();
  const batch: {
    tenantId: string;
    correlationId: string;
    source: "manual";
    events: readonly ScmChangeEvent[];
    force: boolean;
    env: EnvVars;
    resolveRepositoryFullName: (repositoryId: string) => Promise<string | undefined>;
  } = {
    tenantId: input.tenantId,
    correlationId,
    source: "manual",
    events: [match],
    force,
    env,
    resolveRepositoryFullName,
  };

  const qualityEnabled = isVerificationDispatchEnabled(env);
  const securityEnabled = isSecurityDispatchEnabled(env);

  const quality = packs.has("quality")
    ? await triggerVerificationDispatchForPersistedChanges(batch)
    : [];
  const security = packs.has("security")
    ? await triggerSecurityDispatchForPersistedChanges(batch)
    : [];

  return {
    changeEventId,
    quality,
    security,
    qualityEnabled,
    securityEnabled,
    force,
  };
}
