/**
 * Flagship F13 — Developer Early Check runner.
 * Force quality + security packs (+ optional Playwright smoke). Never certifies.
 */

import { randomUUID } from "node:crypto";

import type { ScmChangeEvent } from "@apzhub/platform-scm";

import {
  F9_ASSIST_ORIGIN,
  isAutomationOnChangeEnabled,
} from "@/lib/qep/automation-on-change";
import { getQepAutomationRuntime } from "@/lib/qep/automation-runtime";
import { F13_ASSIST_ORIGIN } from "@/lib/qep/ai-fix-pack";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";
import {
  runVerificationPacksForChange,
  type RunVerificationPacksResult,
} from "@/lib/qep/run-verification-packs";

export type EarlyCheckPlaywrightResult = {
  readonly attempted: boolean;
  readonly enabled: boolean;
  readonly skipped: boolean;
  readonly reason?: string;
  readonly executionId?: string;
};

export type RunEarlyCheckResult = {
  readonly changeEventId: string;
  readonly assistOrigin: typeof F13_ASSIST_ORIGIN;
  readonly packs: RunVerificationPacksResult;
  readonly playwright: EarlyCheckPlaywrightResult;
  readonly advisory: true;
  readonly autoCertified: false;
};

async function resolveChange(
  tenantId: string,
  changeEventId: string,
): Promise<ScmChangeEvent> {
  const scm = getQepScmRuntime();
  const events = await scm.listChangeEvents({ tenantId, limit: 500 });
  const match = events.find((row) => row.changeEventId === changeEventId);
  if (!match) {
    throw new Error("early_check.change_not_found");
  }
  return match;
}

async function triggerPlaywrightForEarlyCheck(input: {
  readonly tenantId: string;
  readonly change: ScmChangeEvent;
  readonly correlationId: string;
  readonly force: boolean;
  readonly env: NodeJS.ProcessEnv;
}): Promise<EarlyCheckPlaywrightResult> {
  const enabled = isAutomationOnChangeEnabled(input.env);
  if (!enabled) {
    return {
      attempted: false,
      enabled: false,
      skipped: true,
      reason: "playwright_flag_off",
    };
  }

  const runtime = getQepAutomationRuntime();
  if (!input.force) {
    const existing = await runtime.listExecutions(input.tenantId);
    const already = existing.some(
      (execution) =>
        execution.target?.metadata?.changeEventId === input.change.changeEventId &&
        (execution.target?.metadata?.assistOrigin === F9_ASSIST_ORIGIN ||
          execution.target?.metadata?.assistOrigin === F13_ASSIST_ORIGIN),
    );
    if (already) {
      return {
        attempted: false,
        enabled: true,
        skipped: true,
        reason: "already_triggered",
      };
    }
  }

  const live = (input.env.APZHUB_AUTOMATION_LIVE ?? "").toLowerCase();
  const dryRun = !(live === "true" || live === "1" || live === "yes");

  try {
    const record = await runtime.enqueueAndRun({
      tenantId: input.tenantId,
      providerId: "playwright",
      correlationId: input.change.correlationId || input.correlationId,
      requestedBy: "system:f13-early-check",
      target: {
        kind: "url",
        name: `F13 Early Check smoke (${input.change.kind})`,
        baseUrl: input.change.htmlUrl ?? "about:blank",
        metadata: {
          changeEventId: input.change.changeEventId,
          assistOrigin: F13_ASSIST_ORIGIN,
          sourceChangeKind: input.change.kind,
          sourceExternalKey: input.change.externalKey,
          scmSource: "manual",
        },
      },
      options: {
        dryRun,
        collectScreenshots: true,
        collectTraces: true,
      },
    });
    return {
      attempted: true,
      enabled: true,
      skipped: false,
      executionId: record.executionId,
    };
  } catch (error) {
    return {
      attempted: true,
      enabled: true,
      skipped: true,
      reason: error instanceof Error ? error.message : "enqueue_failed",
    };
  }
}

/**
 * Self-serve Early Check: force F10+F11 packs; Playwright when F9 flag on.
 */
export async function runEarlyCheckForChange(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly includePlaywright?: boolean;
  readonly force?: boolean;
  readonly env?: NodeJS.ProcessEnv;
}): Promise<RunEarlyCheckResult> {
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("early_check.change_id_required");
  }

  const env = input.env ?? process.env;
  const force = input.force !== false;
  const includePlaywright = input.includePlaywright !== false;

  const packs = await runVerificationPacksForChange({
    tenantId: input.tenantId,
    changeEventId,
    packs: ["quality", "security"],
    force,
    env,
  });

  let playwright: EarlyCheckPlaywrightResult = {
    attempted: false,
    enabled: false,
    skipped: true,
    reason: "playwright_not_requested",
  };

  if (includePlaywright) {
    const change = await resolveChange(input.tenantId, changeEventId);
    playwright = await triggerPlaywrightForEarlyCheck({
      tenantId: input.tenantId,
      change,
      correlationId: randomUUID(),
      force,
      env,
    });
  }

  return {
    changeEventId,
    assistOrigin: F13_ASSIST_ORIGIN,
    packs,
    playwright,
    advisory: true,
    autoCertified: false,
  };
}
