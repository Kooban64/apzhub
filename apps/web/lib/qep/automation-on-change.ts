/**
 * Flagship F9 — auto-start verification when a durable SCM change persists.
 * Opt-in via APZHUB_AUTOMATION_ON_CHANGE. Never auto-certifies / auto GO.
 * Today: Playwright smoke (dry-run unless APZHUB_AUTOMATION_LIVE). Other
 * domains still arrive via CI report ingest.
 */

import type { ScmChangeEvent } from "@apzhub/platform-scm";

import { getQepAutomationRuntime } from "@/lib/qep/automation-runtime";

import type { EnvVars } from "@/lib/env-vars";
export const F9_ASSIST_ORIGIN = "f9_on_change" as const;

export function isAutomationOnChangeEnabled(env: EnvVars = process.env): boolean {
  const raw = (env.APZHUB_AUTOMATION_ON_CHANGE ?? "").toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

/** Pure — which durable changes should kick a default verification run. */
export function selectChangesForAutoVerification(
  events: readonly ScmChangeEvent[],
  limit = 5,
): readonly ScmChangeEvent[] {
  return events
    .filter((event) => event.kind === "commit" || event.kind === "pull_request")
    .slice(0, Math.max(0, limit));
}

export function alreadyTriggeredForChange(
  executions: readonly {
    readonly target?: { readonly metadata?: Readonly<Record<string, string>> };
  }[],
  changeEventId: string,
): boolean {
  return executions.some(
    (execution) =>
      execution.target?.metadata?.changeEventId === changeEventId &&
      execution.target?.metadata?.assistOrigin === F9_ASSIST_ORIGIN,
  );
}

export type AutoVerificationTriggerResult = {
  readonly changeEventId: string;
  readonly skipped: boolean;
  readonly reason?: string;
  readonly executionId?: string;
};

/**
 * Soft-fail trigger for one batch of persisted change events.
 * Must not throw to SCM webhook/sync callers.
 */
export async function triggerAutomationForPersistedChanges(input: {
  readonly tenantId: string;
  readonly correlationId: string;
  readonly source: "webhook" | "sync";
  readonly events: readonly ScmChangeEvent[];
  readonly env?: EnvVars;
}): Promise<readonly AutoVerificationTriggerResult[]> {
  const env = input.env ?? process.env;
  if (!isAutomationOnChangeEnabled(env)) {
    return [];
  }

  const selected = selectChangesForAutoVerification(input.events);
  if (selected.length === 0) return [];

  const results: AutoVerificationTriggerResult[] = [];
  try {
    const runtime = getQepAutomationRuntime();
    const existing = [...(await runtime.listExecutions(input.tenantId))];
    const live = (env.APZHUB_AUTOMATION_LIVE ?? "").toLowerCase();
    const dryRun = !(live === "true" || live === "1" || live === "yes");

    for (const change of selected) {
      if (alreadyTriggeredForChange(existing, change.changeEventId)) {
        results.push({
          changeEventId: change.changeEventId,
          skipped: true,
          reason: "already_triggered",
        });
        continue;
      }
      try {
        const record = await runtime.enqueueAndRun({
          tenantId: input.tenantId,
          providerId: "playwright",
          correlationId: change.correlationId || input.correlationId,
          requestedBy: "system:f9-scm-on-change",
          target: {
            kind: "url",
            name: `F9 change smoke (${change.kind})`,
            baseUrl: change.htmlUrl ?? "about:blank",
            metadata: {
              changeEventId: change.changeEventId,
              assistOrigin: F9_ASSIST_ORIGIN,
              sourceChangeKind: change.kind,
              sourceExternalKey: change.externalKey,
              scmSource: input.source,
            },
          },
          options: {
            dryRun,
            collectScreenshots: true,
            collectTraces: true,
          },
        });
        results.push({
          changeEventId: change.changeEventId,
          skipped: false,
          executionId: record.executionId,
        });
        existing.push(record);
      } catch (error) {
        results.push({
          changeEventId: change.changeEventId,
          skipped: true,
          reason: error instanceof Error ? error.message : "enqueue_failed",
        });
      }
    }
  } catch (error) {
    console.info(
      JSON.stringify({
        channel: "qep-f9-on-change",
        event: "qep.automation.on_change.batch_failed",
        softFail: true,
        error: error instanceof Error ? error.message : "unknown",
      }),
    );
    return results;
  }

  console.info(
    JSON.stringify({
      channel: "qep-f9-on-change",
      event: "qep.automation.on_change.batch",
      source: input.source,
      correlationId: input.correlationId,
      results,
    }),
  );
  return results;
}
