import type { TimeEntry } from "../domain";
import { ReferenceNumberGenerator } from "../reference";
import { createEntityId } from "./id";

export interface TimeEntryFactoryInput {
  readonly matterId: string;
  readonly userId: string;
  readonly entryDate: string;
  readonly durationMinutes: number;
  readonly narrative: string;
  readonly billable?: boolean;
  readonly rate?: number;
  readonly timeEntryReference?: string;
  readonly activityCode?: string;
}

const defaultReferenceGenerator = new ReferenceNumberGenerator();

function calculateAmount(
  durationMinutes: number,
  rate: number,
  billable: boolean,
): number {
  if (!billable || durationMinutes <= 0) {
    return 0;
  }

  return Math.round((durationMinutes / 60) * rate * 100) / 100;
}

export const TimeEntryFactory = {
  create(input: TimeEntryFactoryInput): TimeEntry {
    const billable = input.billable ?? true;
    const rate = input.rate ?? 0;

    return {
      timeEntryId: createEntityId("te"),
      timeEntryReference:
        input.timeEntryReference ?? defaultReferenceGenerator.nextTimeEntryReference(),
      matterId: input.matterId.trim(),
      userId: input.userId.trim(),
      entryDate: input.entryDate,
      durationMinutes: input.durationMinutes,
      narrative: input.narrative.trim(),
      activityCode: input.activityCode,
      billable,
      billingStatus: "unbilled",
      rate,
      amount: calculateAmount(input.durationMinutes, rate, billable),
    };
  },
};
