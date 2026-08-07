import type {
  BusinessJourney,
  BusinessProcessInstance,
  BusinessProcessMonitoring,
  BusinessProcessStageCount,
} from "@apzhub/platform-service-contracts";

const STALL_MS = 7 * 24 * 60 * 60 * 1000;

export function computeBusinessProcessMonitoring(input: {
  readonly journey?: BusinessJourney;
  readonly journeyId?: string;
  readonly instances: readonly BusinessProcessInstance[];
  readonly now?: Date;
}): BusinessProcessMonitoring {
  const now = input.now ?? new Date();
  const nowMs = now.getTime();
  const instances = input.instances;
  const active = instances.filter((i) => i.status === "active");
  const completed = instances.filter((i) => i.status === "completed");
  const overdue = active.filter((i) => i.dueAt && Date.parse(i.dueAt) < nowMs);
  const stalled = active.filter(
    (i) => nowMs - Date.parse(i.enteredStageAt) >= STALL_MS,
  );

  const stageMap = new Map<string, BusinessProcessStageCount>();
  if (input.journey) {
    for (const stage of input.journey.stages) {
      stageMap.set(stage.id, {
        stageId: stage.id,
        stageName: stage.name,
        activeCount: 0,
        stalledCount: 0,
      });
    }
  }

  for (const instance of active) {
    const existing = stageMap.get(instance.currentStageId);
    const isStalled = nowMs - Date.parse(instance.enteredStageAt) >= STALL_MS;
    if (existing) {
      stageMap.set(instance.currentStageId, {
        ...existing,
        activeCount: existing.activeCount + 1,
        stalledCount: existing.stalledCount + (isStalled ? 1 : 0),
      });
    } else {
      stageMap.set(instance.currentStageId, {
        stageId: instance.currentStageId,
        stageName: instance.currentStageId,
        activeCount: 1,
        stalledCount: isStalled ? 1 : 0,
      });
    }
  }

  const denom = active.length + completed.length;
  const completionRatePercent =
    denom === 0 ? 0 : Math.round((completed.length / denom) * 100);

  return Object.freeze({
    journeyId: input.journeyId ?? input.journey?.id,
    activeInstances: active.length,
    stalledStages: stalled.length,
    overdueTransitions: overdue.length,
    completedCount: completed.length,
    completionRatePercent,
    byStage: Object.freeze([...stageMap.values()]),
    computedAt: now.toISOString(),
  });
}
