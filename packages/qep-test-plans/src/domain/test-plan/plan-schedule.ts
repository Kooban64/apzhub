import { createExecutionWindow, type ExecutionWindow } from "./value-objects";

export type TestPlanSchedule = ExecutionWindow & {
  readonly milestoneRef?: string;
  readonly timezone?: string;
};

export type CreateTestPlanScheduleInput = {
  readonly plannedStart?: string;
  readonly plannedEnd?: string;
  readonly milestoneRef?: string;
  readonly timezone?: string;
};

export function createEmptyTestPlanSchedule(): TestPlanSchedule {
  return {};
}

export function createTestPlanSchedule(
  input: CreateTestPlanScheduleInput,
): TestPlanSchedule {
  const window = createExecutionWindow({
    plannedStart: input.plannedStart,
    plannedEnd: input.plannedEnd,
  });
  const milestoneRef = input.milestoneRef?.trim();
  const timezone = input.timezone?.trim();
  return {
    ...window,
    ...(milestoneRef ? { milestoneRef } : {}),
    ...(timezone ? { timezone } : {}),
  };
}

export function clearScheduleDates(schedule: TestPlanSchedule): TestPlanSchedule {
  return {
    ...(schedule.milestoneRef ? { milestoneRef: schedule.milestoneRef } : {}),
    ...(schedule.timezone ? { timezone: schedule.timezone } : {}),
  };
}
