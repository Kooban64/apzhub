import {
  createPlaceholderEventBus,
  type EventBus,
} from "@apzhub/event-notification-framework";
import type { ManagedTimeEntry } from "@apzhub/law-platform/api";

import {
  TimeEntryWorkflowService,
  createEmptyTimeEntryFormValues,
  getLawRepositoryMode,
  getSharedTimeEntryRepository,
  timeEntryToFormValues,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { createWorkflowRunner } from "../framework";
import type {
  CreateTimeEntryV1Request,
  UpdateTimeEntryV1Request,
} from "./time-entry-dto-mapper";
import {
  booleanToBillableInput,
  getTimeEntryApiMetadata,
  touchTimeEntryApiMetadata,
} from "./time-entry-dto-mapper";

let timeEntryApiEventBus: EventBus | undefined;

export function getTimeEntryApiEventBus(): EventBus {
  timeEntryApiEventBus ??= createPlaceholderEventBus();
  return timeEntryApiEventBus;
}

export function resetTimeEntryApiEventBus(): void {
  timeEntryApiEventBus = undefined;
}

const timeEntryWorkflowRunner = createWorkflowRunner({
  createService: (context) =>
    new TimeEntryWorkflowService({
      repository: getSharedTimeEntryRepository(),
      eventBus: getTimeEntryApiEventBus(),
      actorId: context.user?.userId,
    }),
});

export function createTimeEntryWorkflowService(
  context: LawApiAuthenticatedContext,
): TimeEntryWorkflowService {
  return timeEntryWorkflowRunner.createService(context);
}

export async function withTimeEntryWorkflowService<T>(
  context: LawApiAuthenticatedContext,
  operation: (service: TimeEntryWorkflowService) => T | Promise<T>,
): Promise<T> {
  return timeEntryWorkflowRunner.withService(context, operation);
}

export function createTimeEntryFormValuesFromRequest(
  body: CreateTimeEntryV1Request,
  actorUserId?: string,
) {
  return {
    ...createEmptyTimeEntryFormValues(body.matterId),
    matterId: body.matterId,
    entryDate: body.entryDate,
    durationMinutes: String(body.durationMinutes),
    narrative: body.narrative,
    billable: booleanToBillableInput(body.billable),
    userId: actorUserId ?? "",
  };
}

export function mergeUpdateTimeEntryFormValues(
  existing: ManagedTimeEntry,
  body: UpdateTimeEntryV1Request,
) {
  const current = timeEntryToFormValues(existing);

  return {
    ...current,
    entryDate: body.entryDate ?? current.entryDate,
    durationMinutes:
      body.durationMinutes !== undefined
        ? String(body.durationMinutes)
        : current.durationMinutes,
    narrative: body.narrative ?? current.narrative,
    billable:
      body.billable !== undefined
        ? booleanToBillableInput(body.billable)
        : current.billable,
  };
}

export function recordTimeEntryMetadataAfterWrite(
  entry: ManagedTimeEntry,
  created: boolean,
) {
  if (getLawRepositoryMode() === "postgres") {
    return;
  }

  touchTimeEntryApiMetadata(entry.timeEntryId, created);
}

export function resolveTimeEntryMetadata(timeEntryId: string) {
  return getTimeEntryApiMetadata(timeEntryId);
}
