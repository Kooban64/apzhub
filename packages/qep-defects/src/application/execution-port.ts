/**
 * Cap C read port — Defects reference execution; never mutate it.
 */

import type { ExecutionOrigin } from "../domain/types";

export type ExecutionSessionLookup = {
  readonly sessionId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly name: string;
  readonly status: string;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly suiteName?: string;
  readonly steps: readonly {
    readonly stepId: string;
    readonly title: string;
    readonly outcome: string;
    readonly failureNotes?: string;
    readonly evidenceIds: readonly string[];
  }[];
  readonly evidenceIds: readonly string[];
};

export type ExecutionSessionPort = {
  get(tenantId: string, sessionId: string): Promise<ExecutionSessionLookup | undefined>;
};

export function originFromSession(
  session: ExecutionSessionLookup,
  stepId?: string,
): ExecutionOrigin {
  const step = stepId ? session.steps.find((s) => s.stepId === stepId) : undefined;
  return {
    sessionId: session.sessionId,
    ...(stepId ? { stepId } : {}),
    ...(step?.title ? { stepTitle: step.title } : {}),
    ...(step?.outcome ? { stepOutcome: step.outcome } : {}),
    ...(session.planId ? { planId: session.planId } : {}),
    ...(session.suiteId ? { suiteId: session.suiteId } : {}),
    ...(session.suiteName ? { suiteName: session.suiteName } : {}),
    ...(step?.failureNotes ? { failureNotes: step.failureNotes } : {}),
  };
}
