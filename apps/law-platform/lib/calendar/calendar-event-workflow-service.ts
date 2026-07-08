import type { EventBus } from "@apzhub/event-notification-framework";
import { CalendarEventFactory } from "@apzhub/legal-business-core";

import { publishLegalCalendarEvent } from "../publish-legal-calendar-event";
import type {
  CalendarEventFormValues,
  CalendarEventListCriteria,
  ManagedCalendarEvent,
} from "./calendar-event-types";
import { parseReminderMinutesInput } from "./calendar-event-types";
import {
  getCalendarEventWorkflowDiagnostics,
  type CalendarEventWorkflowOperation,
  type CalendarEventWorkflowRunRecord,
  type CalendarEventWorkflowStageRecord,
} from "./calendar-event-workflow-diagnostics";
import { resolveClientIdForMatter } from "./calendar-event-lookups";
import {
  parseAllDayInput,
  validateCalendarEventForm,
} from "./calendar-event-validation";
import type { WritableCalendarEventRepository } from "./writable-calendar-event-repository";

export interface CalendarEventWorkflowServiceOptions {
  readonly repository: WritableCalendarEventRepository;
  readonly eventBus: EventBus;
  readonly actorId?: string;
}

export interface CalendarEventWorkflowResult<T = ManagedCalendarEvent> {
  readonly ok: boolean;
  readonly calendarEvent?: T;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly eventId?: string;
  readonly run: CalendarEventWorkflowRunRecord;
}

function recordStage(
  stages: CalendarEventWorkflowStageRecord[],
  operation: CalendarEventWorkflowOperation,
  stage: CalendarEventWorkflowStageRecord["stage"],
  startedAt: number,
  ok: boolean,
  detail?: string,
): void {
  stages.push({
    operation,
    stage,
    ok,
    durationMs: performance.now() - startedAt,
    detail,
  });
}

function toCalendarPayload(
  event: ManagedCalendarEvent,
  extras: Record<string, string> = {},
) {
  return {
    calendarEventId: event.calendarEventId,
    calendarEventReference: event.calendarEventReference,
    title: event.title,
    eventType: event.eventType,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    allDay: event.allDay,
    matterId: event.matterId ?? "",
    clientId: event.clientId ?? "",
    ownerUserId: event.ownerUserId,
    calendarEventStatus: event.calendarEventStatus,
    taskId: event.taskId,
    documentId: event.documentId,
    timeEntryId: event.timeEntryId,
    ...extras,
  };
}

function buildManagedEvent(
  base: ReturnType<typeof CalendarEventFactory.create>,
  values: CalendarEventFormValues,
  existing?: ManagedCalendarEvent,
): ManagedCalendarEvent {
  const matterId = values.matterId.trim();
  const clientId =
    values.clientId.trim() || resolveClientIdForMatter(matterId) || existing?.clientId;

  return {
    ...base,
    calendarEventReference:
      values.calendarEventReference.trim().length > 0
        ? values.calendarEventReference.trim()
        : (existing?.calendarEventReference ?? CalendarEventFactory.nextReference()),
    title: values.title.trim(),
    eventType: values.eventType,
    startsAt: new Date(values.startsAt).toISOString(),
    endsAt: new Date(values.endsAt).toISOString(),
    allDay: parseAllDayInput(values.allDay),
    matterId,
    clientId: clientId || undefined,
    ownerUserId: values.ownerUserId.trim(),
    calendarEventStatus: values.calendarEventStatus,
    location: values.location.trim() || undefined,
    description: values.description.trim() || undefined,
    taskId: values.taskId.trim() || undefined,
    documentId: values.documentId.trim() || undefined,
    timeEntryId: values.timeEntryId.trim() || undefined,
    reminderMinutes: parseReminderMinutesInput(values.reminderMinutes),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

/** Complete in-memory calendar workflow — validate, factory, repository, events (LAW-008-01). */
export class CalendarEventWorkflowService {
  constructor(private readonly options: CalendarEventWorkflowServiceOptions) {}

  createCalendarEvent(
    values: CalendarEventFormValues,
    commandId = "legal.calendar.create",
  ): CalendarEventWorkflowResult {
    return this.runMutation(
      "create",
      commandId,
      values,
      (validated) => {
        const created = CalendarEventFactory.create({
          title: validated.title,
          eventType: validated.eventType,
          startsAt: new Date(validated.startsAt).toISOString(),
          endsAt: new Date(validated.endsAt).toISOString(),
          ownerUserId: validated.ownerUserId.trim(),
          matterId: validated.matterId.trim(),
          allDay: parseAllDayInput(validated.allDay),
          calendarEventStatus: validated.calendarEventStatus,
          reminderMinutes: parseReminderMinutesInput(validated.reminderMinutes),
        });

        return this.options.repository.create(buildManagedEvent(created, validated));
      },
      "created",
    );
  }

  updateCalendarEvent(
    calendarEventId: string,
    values: CalendarEventFormValues,
    commandId = "legal.calendar.edit",
  ): CalendarEventWorkflowResult {
    const existing = this.options.repository.getById(calendarEventId);
    if (!existing) {
      return this.failure(
        "update",
        commandId,
        { calendarEventId },
        "Calendar event not found.",
      );
    }

    return this.runMutation(
      "update",
      commandId,
      values,
      (validated) => {
        const updated = buildManagedEvent(
          {
            ...existing,
            calendarEventId: existing.calendarEventId,
          },
          validated,
          existing,
        );

        return this.options.repository.update(calendarEventId, updated);
      },
      "updated",
    );
  }

  openCalendarEvent(
    calendarEventId: string,
    commandId = "legal.calendar.open",
  ): CalendarEventWorkflowResult {
    return this.runReadEvent("open", commandId, calendarEventId, "viewed");
  }

  cancelCalendarEvent(
    calendarEventId: string,
    commandId = "legal.calendar.cancel",
  ): CalendarEventWorkflowResult {
    const startedAt = performance.now();
    const stages: CalendarEventWorkflowStageRecord[] = [];
    const operation: CalendarEventWorkflowOperation = "cancel";
    const repoStart = performance.now();

    const cancelled = this.options.repository.cancel(calendarEventId);
    recordStage(stages, operation, "repository", repoStart, Boolean(cancelled));

    if (!cancelled) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        calendarEventId,
      });
      getCalendarEventWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalCalendarEvent(
      this.options.eventBus,
      "cancelled",
      toCalendarPayload(cancelled, { commandId }),
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );
    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    const run = this.buildRun({
      operation,
      commandId,
      ok: published.ok,
      startedAt,
      stages,
      calendarEventId,
      matterId: cancelled.matterId,
      eventId: published.eventId,
    });
    getCalendarEventWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      calendarEvent: cancelled,
      eventId: published.eventId,
      run,
    };
  }

  searchCalendarEvents(
    criteria: CalendarEventListCriteria,
    commandId = "legal.calendar.search",
  ): CalendarEventWorkflowResult<readonly ManagedCalendarEvent[]> {
    const startedAt = performance.now();
    const stages: CalendarEventWorkflowStageRecord[] = [];
    const operation: CalendarEventWorkflowOperation = "search";
    const repoStart = performance.now();

    const results = this.options.repository.list(criteria);
    recordStage(
      stages,
      operation,
      "repository",
      repoStart,
      true,
      `${results.length} results`,
    );

    const eventStart = performance.now();
    const published = publishLegalCalendarEvent(
      this.options.eventBus,
      "viewed",
      {
        calendarEventId: "search",
        calendarEventReference: "SEARCH",
        title: "Calendar search",
        eventType: "internal",
        startsAt: new Date().toISOString(),
        endsAt: new Date().toISOString(),
        allDay: false,
        matterId: "",
        clientId: "",
        ownerUserId: "",
        calendarEventStatus: "scheduled",
        commandId,
        query: criteria.query ?? "",
      },
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );

    const run = this.buildRun({
      operation,
      commandId,
      ok: true,
      startedAt,
      stages,
      eventId: published.eventId,
    });
    getCalendarEventWorkflowDiagnostics().record(run);

    return { ok: true, calendarEvent: results, eventId: published.eventId, run };
  }

  private runReadEvent(
    operation: Extract<CalendarEventWorkflowOperation, "open">,
    commandId: string,
    calendarEventId: string,
    verb: "viewed",
  ): CalendarEventWorkflowResult {
    const startedAt = performance.now();
    const stages: CalendarEventWorkflowStageRecord[] = [];
    const stageStart = performance.now();

    const event = this.options.repository.getById(calendarEventId);
    recordStage(
      stages,
      operation,
      "repository",
      stageStart,
      Boolean(event),
      event?.calendarEventReference,
    );

    if (!event) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        calendarEventId,
      });
      getCalendarEventWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalCalendarEvent(
      this.options.eventBus,
      verb,
      toCalendarPayload(event, { commandId }),
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );
    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    const run = this.buildRun({
      operation,
      commandId,
      ok: published.ok,
      startedAt,
      stages,
      calendarEventId,
      matterId: event.matterId,
      eventId: published.eventId,
    });
    getCalendarEventWorkflowDiagnostics().record(run);

    return { ok: published.ok, calendarEvent: event, eventId: published.eventId, run };
  }

  private runMutation(
    operation: Extract<CalendarEventWorkflowOperation, "create" | "update">,
    commandId: string,
    values: CalendarEventFormValues,
    mutate: (values: CalendarEventFormValues) => ManagedCalendarEvent | undefined,
    verb: "created" | "updated",
  ): CalendarEventWorkflowResult {
    const startedAt = performance.now();
    const stages: CalendarEventWorkflowStageRecord[] = [];

    const validationStart = performance.now();
    const validation = validateCalendarEventForm(values);
    recordStage(stages, operation, "validation", validationStart, validation.valid);
    if (!validation.valid) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        validationErrors: validation.errors,
      });
      getCalendarEventWorkflowDiagnostics().record(run);
      return { ok: false, validationErrors: validation.errors, run };
    }

    const factoryStart = performance.now();
    let event: ManagedCalendarEvent | undefined;
    try {
      event = mutate(values);
      recordStage(stages, operation, "factory", factoryStart, Boolean(event));
    } catch (error) {
      recordStage(
        stages,
        operation,
        "factory",
        factoryStart,
        false,
        error instanceof Error ? error.message : "Factory error",
      );
    }

    const repoStart = performance.now();
    recordStage(stages, operation, "repository", repoStart, Boolean(event));
    if (!event) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
      });
      getCalendarEventWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalCalendarEvent(
      this.options.eventBus,
      verb,
      toCalendarPayload(event, { commandId }),
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );
    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    const run = this.buildRun({
      operation,
      commandId,
      ok: published.ok,
      startedAt,
      stages,
      calendarEventId: event.calendarEventId,
      matterId: event.matterId,
      eventId: published.eventId,
    });
    getCalendarEventWorkflowDiagnostics().record(run);

    return { ok: published.ok, calendarEvent: event, eventId: published.eventId, run };
  }

  private failure(
    operation: CalendarEventWorkflowOperation,
    commandId: string,
    details: { readonly calendarEventId?: string },
    message: string,
  ): CalendarEventWorkflowResult {
    const startedAt = performance.now();
    const run = this.buildRun({
      operation,
      commandId,
      ok: false,
      startedAt,
      stages: [
        {
          operation,
          stage: "repository",
          ok: false,
          durationMs: 0,
          detail: message,
        },
      ],
      calendarEventId: details.calendarEventId,
    });
    getCalendarEventWorkflowDiagnostics().record(run);
    return { ok: false, run };
  }

  private buildRun(input: {
    readonly operation: CalendarEventWorkflowOperation;
    readonly commandId?: string;
    readonly ok: boolean;
    readonly startedAt: number;
    readonly stages: CalendarEventWorkflowStageRecord[];
    readonly calendarEventId?: string;
    readonly matterId?: string;
    readonly eventId?: string;
    readonly validationErrors?: Readonly<Record<string, string>>;
  }): CalendarEventWorkflowRunRecord {
    return {
      operation: input.operation,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - input.startedAt,
      ok: input.ok,
      commandId: input.commandId,
      eventId: input.eventId,
      calendarEventId: input.calendarEventId,
      matterId: input.matterId,
      validationErrors: input.validationErrors,
      stages: input.stages,
    };
  }
}

/** Alias matching LAW-008-01 workflow diagram naming. */
export { CalendarEventWorkflowService as CalendarWorkflowService };
