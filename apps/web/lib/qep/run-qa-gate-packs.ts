/**
 * Flagship F15 — QA runs verification packs including pen-test (security).
 * Same spine as F13 Early Check; assistOrigin marks QA Gate. Never certifies.
 */

import { F15_ASSIST_ORIGIN } from "@/lib/qep/qa-gate";
import { requireEntitlement } from "@/lib/commercial/entitlements";
import {
  runEarlyCheckForChange,
  type RunEarlyCheckResult,
} from "@/lib/qep/run-early-check";
import {
  runVerificationPacksForChange,
  type RunVerificationPacksResult,
} from "@/lib/qep/run-verification-packs";

import type { EnvVars } from "@/lib/env-vars";
export type RunQaGatePacksResult = {
  readonly changeEventId: string;
  readonly assistOrigin: typeof F15_ASSIST_ORIGIN;
  readonly packs: RunVerificationPacksResult;
  readonly playwright: RunEarlyCheckResult["playwright"];
  /** Explicit: security pack = pen-test domains (trivy/semgrep/nuclei/zap). */
  readonly penTestIncluded: boolean;
  readonly advisory: true;
  readonly autoCertified: false;
};

/**
 * Force quality + security (pen-test) packs for QA Gate.
 * Playwright optional when F9 flag on.
 */
export async function runQaGatePacksForChange(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  /** Default true — QA may run pen-test / security pack. */
  readonly includePenTest?: boolean;
  readonly includeQuality?: boolean;
  readonly includePlaywright?: boolean;
  readonly force?: boolean;
  readonly env?: EnvVars;
}): Promise<RunQaGatePacksResult> {
  let includePenTest = input.includePenTest !== false;
  if (includePenTest) {
    const decision = requireEntitlement(input.tenantId, "cap.qep.pentest");
    if (!decision.allowed) {
      // Soft-fail: run quality only when pen-test not entitled (upgrade path).
      includePenTest = false;
    }
  }
  const includeQuality = input.includeQuality !== false;
  const packs: ("quality" | "security")[] = [];
  if (includeQuality) packs.push("quality");
  if (includePenTest) packs.push("security");
  if (packs.length === 0) {
    throw new Error("qa_gate.packs_required");
  }

  const packResult = await runVerificationPacksForChange({
    tenantId: input.tenantId,
    changeEventId: input.changeEventId,
    packs,
    force: input.force !== false,
    env: input.env,
  });

  // Reuse Early Check Playwright path when requested (same runner contract).
  let playwright: RunEarlyCheckResult["playwright"] = {
    attempted: false,
    enabled: false,
    skipped: true,
    reason: "playwright_not_requested",
  };
  if (input.includePlaywright) {
    const early = await runEarlyCheckForChange({
      tenantId: input.tenantId,
      changeEventId: input.changeEventId,
      includePlaywright: true,
      force: input.force !== false,
      env: input.env,
    });
    playwright = early.playwright;
  }

  return {
    changeEventId: input.changeEventId,
    assistOrigin: F15_ASSIST_ORIGIN,
    packs: packResult,
    playwright,
    penTestIncluded: includePenTest,
    advisory: true,
    autoCertified: false,
  };
}
