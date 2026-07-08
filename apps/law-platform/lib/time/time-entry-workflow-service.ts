import type { EventBus } from "@apzhub/event-notification-framework";
import { TimeEntryFactory } from "@apzhub/legal-business-core";

import { publishLegalTimeEvent } from "../publish-legal-time-event";
import type {
  ManagedTimeEntry,
  TimeEntryFormValues,
  TimeEntryListCriteria,
} from "./time-entry-types";
import { resolveFormDurationMinutes } from "./time-entry-types";
import {
  getTimeEntryWorkflowDiagnostics,
  type TimeEntryWorkflowOperation,
  type TimeEntryWorkflowRunRecord,
  type TimeEntryWorkflowStageRecord,
} from "./time-entry-workflow-diagnostics";
import { parseBillableInput, validateTimeEntryForm } from "./time-entry-validation";
import { resolveAttorneyRate } from "./time-entry-lookups";
import type { WritableTimeEntryRepository } from "./writable-time-entry-repository";

export interface TimeEntryWorkflowServiceOptions {
  readonly repository: WritableTimeEntryRepository;
  readonly eventBus: EventBus;
  readonly actorId?: string;
}

export interface TimeEntryWorkflowResult<T = ManagedTimeEntry> {
  readonly ok: boolean;
  readonly timeEntry?: T;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly eventId?: string;
  readonly run: TimeEntryWorkflowRunRecord;
}

function recordStage(
  stages: TimeEntryWorkflowStageRecord[],
  operation: TimeEntryWorkflowOperation,
  stage: TimeEntryWorkflowStageRecord["stage"],
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

function toTimePayload(entry: ManagedTimeEntry, extras: Record<string, string> = {}) {
  return {
    timeEntryId: entry.timeEntryId,
    timeEntryReference: entry.timeEntryReference,
    narrative: entry.narrative,
    matterId: entry.matterId,
    userId: entry.userId,
    entryDate: entry.entryDate,
    durationMinutes: entry.durationMinutes,
    billable: entry.billable,
    amount: entry.amount,
    taskId: entry.taskId,
    documentId: entry.documentId,
    ...extras,
  };
}

function buildManagedEntry(
  base: ReturnType<typeof TimeEntryFactory.create>,
  values: TimeEntryFormValues,
  existing?: ManagedTimeEntry,
): ManagedTimeEntry {
  const durationMinutes = resolveFormDurationMinutes(values);
  const billable = parseBillableInput(values.billable);
  const rate = existing?.rate ?? resolveAttorneyRate(values.userId.trim());
  const amount =
    billable && durationMinutes > 0
      ? Math.round((durationMinutes / 60) * rate * 100) / 100
      : 0;

  return {
    ...base,
    durationMinutes,
    billable,
    rate,
    amount,
    narrative: values.narrative.trim(),
    entryDate: new Date(values.entryDate).toISOString().slice(0, 10),
    userId: values.userId.trim(),
    matterId: values.matterId.trim(),
    taskId: values.taskId.trim() || undefined,
    documentId: values.documentId.trim() || undefined,
    startTime: values.startTime.trim()
      ? new Date(values.startTime).toISOString()
      : undefined,
    endTime: values.endTime.trim() ? new Date(values.endTime).toISOString() : undefined,
    billingStatus: existing?.billingStatus ?? "unbilled",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    timeEntryReference:
      values.timeEntryReference.trim().length > 0
        ? values.timeEntryReference.trim()
        : base.timeEntryReference,
  };
}

/** Complete in-memory time entry workflow — validate, factory, repository, events (LAW-006-01). */
export class TimeEntryWorkflowService {
  constructor(private readonly options: TimeEntryWorkflowServiceOptions) {}

  createTimeEntry(
    values: TimeEntryFormValues,
    commandId = "legal.time.create",
  ): TimeEntryWorkflowResult {
    return this.runMutation(
      "create",
      commandId,
      values,
      (validated) => {
        const created = TimeEntryFactory.create({
          matterId: validated.matterId.trim(),
          userId: validated.userId.trim(),
          entryDate: new Date(validated.entryDate).toISOString().slice(0, 10),
          durationMinutes: resolveFormDurationMinutes(validated),
          narrative: validated.narrative,
          billable: parseBillableInput(validated.billable),
          rate: resolveAttorneyRate(validated.userId.trim()),
          timeEntryReference: validated.timeEntryReference.trim() || undefined,
        });

        return this.options.repository.create(buildManagedEntry(created, validated));
      },
      "created",
    );
  }

  updateTimeEntry(
    timeEntryId: string,
    values: TimeEntryFormValues,
    commandId = "legal.time.edit",
  ): TimeEntryWorkflowResult {
    const existing = this.options.repository.getById(timeEntryId);
    if (!existing) {
      return this.failure(
        "update",
        commandId,
        { timeEntryId },
        "Time entry not found.",
      );
    }

    return this.runMutation(
      "update",
      commandId,
      values,
      (validated) => {
        const updated = buildManagedEntry(
          {
            ...existing,
            timeEntryId: existing.timeEntryId,
            timeEntryReference: existing.timeEntryReference,
          },
          validated,
          existing,
        );

        return this.options.repository.update(timeEntryId, updated);
      },
      "updated",
    );
  }

  openTimeEntry(
    timeEntryId: string,
    commandId = "legal.time.open",
  ): TimeEntryWorkflowResult {
    return this.runReadEvent("open", commandId, timeEntryId, "viewed");
  }

  deleteTimeEntry(
    timeEntryId: string,
    commandId = "legal.time.delete",
  ): TimeEntryWorkflowResult {
    const startedAt = performance.now();
    const stages: TimeEntryWorkflowStageRecord[] = [];
    const operation: TimeEntryWorkflowOperation = "delete";
    const repoStart = performance.now();

    const deleted = this.options.repository.softDelete(timeEntryId);
    recordStage(stages, operation, "repository", repoStart, Boolean(deleted));

    if (!deleted) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        timeEntryId,
      });
      getTimeEntryWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalTimeEvent(
      this.options.eventBus,
      "deleted",
      toTimePayload(deleted, { commandId }),
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
      timeEntryId,
      matterId: deleted.matterId,
      eventId: published.eventId,
    });
    getTimeEntryWorkflowDiagnostics().record(run);

    return { ok: published.ok, timeEntry: deleted, eventId: published.eventId, run };
  }

  searchTimeEntries(
    criteria: TimeEntryListCriteria,
    commandId = "legal.time.search",
  ): TimeEntryWorkflowResult<readonly ManagedTimeEntry[]> {
    const startedAt = performance.now();
    const stages: TimeEntryWorkflowStageRecord[] = [];
    const operation: TimeEntryWorkflowOperation = "search";
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
    const published = publishLegalTimeEvent(
      this.options.eventBus,
      "viewed",
      {
        timeEntryId: "search",
        timeEntryReference: "SEARCH",
        narrative: "Time entry search",
        matterId: "",
        userId: "",
        entryDate: new Date().toISOString().slice(0, 10),
        durationMinutes: 0,
        billable: false,
        amount: 0,
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
    getTimeEntryWorkflowDiagnostics().record(run);

    return { ok: true, timeEntry: results, eventId: published.eventId, run };
  }

  private runReadEvent(
    operation: Extract<TimeEntryWorkflowOperation, "open">,
    commandId: string,
    timeEntryId: string,
    verb: "viewed",
  ): TimeEntryWorkflowResult {
    const startedAt = performance.now();
    const stages: TimeEntryWorkflowStageRecord[] = [];
    const stageStart = performance.now();

    const entry = this.options.repository.getById(timeEntryId);
    recordStage(
      stages,
      operation,
      "repository",
      stageStart,
      Boolean(entry),
      entry?.timeEntryReference,
    );

    if (!entry) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        timeEntryId,
      });
      getTimeEntryWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalTimeEvent(
      this.options.eventBus,
      verb,
      toTimePayload(entry, { commandId }),
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
      timeEntryId,
      matterId: entry.matterId,
      eventId: published.eventId,
    });
    getTimeEntryWorkflowDiagnostics().record(run);

    return { ok: published.ok, timeEntry: entry, eventId: published.eventId, run };
  }

  private runMutation(
    operation: Extract<TimeEntryWorkflowOperation, "create" | "update">,
    commandId: string,
    values: TimeEntryFormValues,
    mutate: (values: TimeEntryFormValues) => ManagedTimeEntry | undefined,
    verb: "created" | "updated",
  ): TimeEntryWorkflowResult {
    const startedAt = performance.now();
    const stages: TimeEntryWorkflowStageRecord[] = [];

    const validationStart = performance.now();
    const validation = validateTimeEntryForm(values);
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
      getTimeEntryWorkflowDiagnostics().record(run);
      return { ok: false, validationErrors: validation.errors, run };
    }

    const factoryStart = performance.now();
    let entry: ManagedTimeEntry | undefined;
    try {
      entry = mutate(values);
      recordStage(stages, operation, "factory", factoryStart, Boolean(entry));
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
    recordStage(stages, operation, "repository", repoStart, Boolean(entry));
    if (!entry) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
      });
      getTimeEntryWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalTimeEvent(
      this.options.eventBus,
      verb,
      toTimePayload(entry, { commandId }),
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
      timeEntryId: entry.timeEntryId,
      matterId: entry.matterId,
      eventId: published.eventId,
    });
    getTimeEntryWorkflowDiagnostics().record(run);

    return { ok: published.ok, timeEntry: entry, eventId: published.eventId, run };
  }

  private failure(
    operation: TimeEntryWorkflowOperation,
    commandId: string,
    details: { readonly timeEntryId?: string },
    message: string,
  ): TimeEntryWorkflowResult {
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
      timeEntryId: details.timeEntryId,
    });
    getTimeEntryWorkflowDiagnostics().record(run);
    return { ok: false, run };
  }

  private buildRun(input: {
    readonly operation: TimeEntryWorkflowOperation;
    readonly commandId?: string;
    readonly ok: boolean;
    readonly startedAt: number;
    readonly stages: TimeEntryWorkflowStageRecord[];
    readonly timeEntryId?: string;
    readonly matterId?: string;
    readonly eventId?: string;
    readonly validationErrors?: Readonly<Record<string, string>>;
  }): TimeEntryWorkflowRunRecord {
    return {
      operation: input.operation,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - input.startedAt,
      ok: input.ok,
      commandId: input.commandId,
      eventId: input.eventId,
      timeEntryId: input.timeEntryId,
      matterId: input.matterId,
      validationErrors: input.validationErrors,
      stages: input.stages,
    };
  }
}
