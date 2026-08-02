/**
 * Cap B handoff port — Execution Planning remains authoritative for plans.
 */

import type { PlanningSnapshot } from "../domain/types";

export type PlanHandoffLookup = {
  readonly planId: string;
  readonly handoffId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly planName: string;
  readonly suiteId: string;
  readonly suiteVersion: number;
  readonly suiteName: string;
  readonly environmentLabels: readonly string[];
  readonly configurationLabels: readonly string[];
  readonly assigneeIds: readonly string[];
  readonly plannedStartAt?: string;
  readonly plannedEndAt?: string;
  readonly handedOffAt: string;
  readonly correlationId: string;
  readonly status: string;
};

export type PlanHandoffPort = {
  getByHandoff(
    tenantId: string,
    handoffId: string,
  ): Promise<PlanHandoffLookup | undefined>;
  getByPlanId(tenantId: string, planId: string): Promise<PlanHandoffLookup | undefined>;
};

export function toPlanningSnapshot(lookup: PlanHandoffLookup): PlanningSnapshot {
  return {
    planId: lookup.planId,
    handoffId: lookup.handoffId,
    planName: lookup.planName,
    suiteId: lookup.suiteId,
    suiteVersion: lookup.suiteVersion,
    suiteName: lookup.suiteName,
    ...(lookup.projectId ? { projectId: lookup.projectId } : {}),
    environmentLabels: lookup.environmentLabels,
    configurationLabels: lookup.configurationLabels,
    assigneeIds: lookup.assigneeIds,
    ...(lookup.plannedStartAt ? { plannedStartAt: lookup.plannedStartAt } : {}),
    ...(lookup.plannedEndAt ? { plannedEndAt: lookup.plannedEndAt } : {}),
    handedOffAt: lookup.handedOffAt,
    correlationId: lookup.correlationId,
  };
}
