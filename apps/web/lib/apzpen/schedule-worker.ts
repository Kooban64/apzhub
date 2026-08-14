/**
 * APZPEN background schedule worker — due tick (SPR-APZPEN-014).
 * Selects engagements whose nextRunAt is due and dispatches CE default tools.
 */

import type { Engagement } from "./types";
import type { DispatchTool } from "./runner-dispatch";

export const DEFAULT_SCHEDULE_TOOLS: readonly DispatchTool[] = ["nuclei", "trivy"];

export type ScheduleTickCandidate = {
  readonly engagement: Engagement;
  readonly tools: readonly DispatchTool[];
};

export type ScheduleTickPlan = {
  readonly due: readonly ScheduleTickCandidate[];
  readonly skipped: readonly {
    readonly engagementId: string;
    readonly reason: string;
  }[];
};

const FREQUENT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // weekly CE default

export function isEngagementDue(eng: Engagement, nowMs: number = Date.now()): boolean {
  if (eng.status === "certified" || eng.status === "closed") return false;
  if (eng.roe.status !== "approved") return false;
  if (eng.scope.length < 1) return false;
  if (eng.scheduleMode === "on_demand") return false;
  if (!eng.nextRunAt) return false;
  const dueAt = Date.parse(eng.nextRunAt);
  if (Number.isNaN(dueAt)) return false;
  return dueAt <= nowMs;
}

export function nextRunAfterTick(
  eng: Engagement,
  nowIso: string = new Date().toISOString(),
): string | undefined {
  if (eng.scheduleMode === "once") {
    return undefined; // clear after run
  }
  if (eng.scheduleMode === "frequent") {
    const base = Date.parse(nowIso);
    return new Date(base + FREQUENT_INTERVAL_MS).toISOString();
  }
  return eng.nextRunAt;
}

export function planScheduleTick(input: {
  readonly engagements: readonly Engagement[];
  readonly nowMs?: number;
  readonly tools?: readonly DispatchTool[];
}): ScheduleTickPlan {
  const nowMs = input.nowMs ?? Date.now();
  const tools = input.tools ?? DEFAULT_SCHEDULE_TOOLS;
  const due: ScheduleTickCandidate[] = [];
  const skipped: { engagementId: string; reason: string }[] = [];

  for (const eng of input.engagements) {
    if (eng.scheduleMode === "on_demand") {
      skipped.push({
        engagementId: eng.engagementId,
        reason: "on_demand",
      });
      continue;
    }
    if (!eng.nextRunAt) {
      skipped.push({
        engagementId: eng.engagementId,
        reason: "no_next_run",
      });
      continue;
    }
    if (eng.status === "certified" || eng.status === "closed") {
      skipped.push({
        engagementId: eng.engagementId,
        reason: "terminal_status",
      });
      continue;
    }
    if (eng.roe.status !== "approved") {
      skipped.push({
        engagementId: eng.engagementId,
        reason: "roe_not_approved",
      });
      continue;
    }
    if (eng.scope.length < 1) {
      skipped.push({
        engagementId: eng.engagementId,
        reason: "no_scope",
      });
      continue;
    }
    if (!isEngagementDue(eng, nowMs)) {
      skipped.push({
        engagementId: eng.engagementId,
        reason: "not_due",
      });
      continue;
    }
    due.push({ engagement: eng, tools });
  }

  return { due, skipped };
}
