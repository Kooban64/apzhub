import type { EventBus } from "@apzhub/event-notification-framework";
import { MatterFactory, type Matter } from "@apzhub/legal-business-core";

import { publishLegalMatterEvent } from "../publish-legal-matter-event";
import {
  composeMatterWorkspaceSnapshot,
  type MatterWorkspaceSnapshot,
} from "./matter-workspace-composition";
import type { MatterFormValues, MatterListCriteria } from "./matter-types";
import {
  getMatterWorkflowDiagnostics,
  type MatterWorkflowOperation,
  type MatterWorkflowRunRecord,
  type MatterWorkflowStageRecord,
} from "./matter-workflow-diagnostics";
import {
  parseCustomFieldsInput,
  parseTagsInput,
  validateMatterForm,
} from "./matter-validation";
import type { WritableMatterRepository } from "./writable-matter-repository";

export interface MatterWorkflowServiceOptions {
  readonly repository: WritableMatterRepository;
  readonly eventBus: EventBus;
  readonly actorId?: string;
}

export interface MatterWorkflowResult<T = Matter> {
  readonly ok: boolean;
  readonly matter?: T;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly eventId?: string;
  readonly run: MatterWorkflowRunRecord;
}

function recordStage(
  stages: MatterWorkflowStageRecord[],
  operation: MatterWorkflowOperation,
  stage: MatterWorkflowStageRecord["stage"],
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

function toMatterPayload(matter: Matter, extras: Record<string, string> = {}) {
  return {
    matterId: matter.matterId,
    matterReference: matter.matterReference,
    title: matter.title,
    clientId: matter.clientId,
    matterTypeId: matter.matterTypeId,
    matterStatus: matter.matterStatus,
    practiceAreaId: matter.practiceAreaId,
    priority: matter.priority,
    leadAttorneyId: matter.leadAttorneyId,
    ...extras,
  };
}

/** Complete in-memory matter workflow — validate, factory, repository, events (LAW-003-01). */
export class MatterWorkflowService {
  constructor(private readonly options: MatterWorkflowServiceOptions) {}

  createMatter(
    values: MatterFormValues,
    commandId = "legal.matter.create",
  ): MatterWorkflowResult {
    return this.runMutation(
      "create",
      commandId,
      values,
      (validated) => {
        const matter = MatterFactory.create({
          title: validated.title,
          clientId: validated.clientId,
          matterTypeId: validated.matterTypeId,
          practiceAreaId: validated.practiceAreaId,
          leadAttorneyId: validated.leadAttorneyId,
          matterReference: validated.matterReference.trim() || undefined,
          matterStatus: validated.matterStatus,
          priority: validated.priority,
        });

        const withExtras: Matter = {
          ...matter,
          description: validated.description.trim() || undefined,
          tags: parseTagsInput(validated.tags),
          customFields: parseCustomFieldsInput(validated.customFields),
        };

        return this.options.repository.create(withExtras);
      },
      "created",
    );
  }

  updateMatter(
    matterId: string,
    values: MatterFormValues,
    commandId = "legal.matter.edit",
  ): MatterWorkflowResult {
    const existing = this.options.repository.getById(matterId);
    if (!existing) {
      return this.failure("update", commandId, { matterId }, "Matter not found.");
    }

    return this.runMutation(
      "update",
      commandId,
      values,
      (validated) => {
        const updated: Matter = {
          ...existing,
          title: validated.title.trim(),
          description: validated.description.trim() || undefined,
          clientId: validated.clientId,
          matterTypeId: validated.matterTypeId,
          matterStatus: validated.matterStatus,
          practiceAreaId: validated.practiceAreaId,
          priority: validated.priority,
          leadAttorneyId: validated.leadAttorneyId,
          matterReference:
            validated.matterReference.trim().length > 0
              ? validated.matterReference.trim()
              : existing.matterReference,
          teamMemberIds: existing.teamMemberIds.includes(validated.leadAttorneyId)
            ? existing.teamMemberIds
            : [validated.leadAttorneyId, ...existing.teamMemberIds],
          tags: parseTagsInput(validated.tags),
          customFields: parseCustomFieldsInput(validated.customFields),
        };

        return this.options.repository.update(matterId, updated);
      },
      "updated",
    );
  }

  openMatter(matterId: string, commandId = "legal.matter.open"): MatterWorkflowResult {
    const startedAt = performance.now();
    const stages: MatterWorkflowStageRecord[] = [];
    const operation: MatterWorkflowOperation = "open";
    const stageStart = performance.now();

    const matter = this.options.repository.getById(matterId);
    recordStage(
      stages,
      operation,
      "repository",
      stageStart,
      Boolean(matter),
      matter?.matterReference,
    );

    if (!matter) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        matterId,
      });
      getMatterWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalMatterEvent(
      this.options.eventBus,
      "viewed",
      toMatterPayload(matter, { commandId }),
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
      matterId,
      eventId: published.eventId,
    });
    getMatterWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      matter,
      eventId: published.eventId,
      run,
    };
  }

  openMatterWorkspace(
    matterId: string,
    commandId = "legal.matter.workspace.open",
  ): MatterWorkflowResult<MatterWorkspaceSnapshot> {
    const startedAt = performance.now();
    const stages: MatterWorkflowStageRecord[] = [];
    const operation: MatterWorkflowOperation = "openWorkspace";
    const repoStart = performance.now();

    const matter = this.options.repository.getById(matterId);
    recordStage(
      stages,
      operation,
      "repository",
      repoStart,
      Boolean(matter),
      matter?.matterReference,
    );

    if (!matter) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        matterId,
      });
      getMatterWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const compositionStart = performance.now();
    const snapshot = composeMatterWorkspaceSnapshot(matter);
    recordStage(
      stages,
      operation,
      "factory",
      compositionStart,
      true,
      snapshot.matterTitle,
    );

    const eventStart = performance.now();
    const published = publishLegalMatterEvent(
      this.options.eventBus,
      "workspace.opened",
      toMatterPayload(matter, { commandId }),
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
      matterId,
      eventId: published.eventId,
    });
    getMatterWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      matter: snapshot,
      eventId: published.eventId,
      run,
    };
  }

  refreshMatterWorkspace(
    matterId: string,
    commandId = "legal.matter.workspace.refresh",
  ): MatterWorkflowResult<MatterWorkspaceSnapshot> {
    const startedAt = performance.now();
    const stages: MatterWorkflowStageRecord[] = [];
    const operation: MatterWorkflowOperation = "refreshWorkspace";
    const repoStart = performance.now();

    const matter = this.options.repository.getById(matterId);
    recordStage(
      stages,
      operation,
      "repository",
      repoStart,
      Boolean(matter),
      matter?.matterReference,
    );

    if (!matter) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        matterId,
      });
      getMatterWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const compositionStart = performance.now();
    const snapshot = composeMatterWorkspaceSnapshot(matter);
    recordStage(
      stages,
      operation,
      "factory",
      compositionStart,
      true,
      snapshot.refreshedAt,
    );

    const run = this.buildRun({
      operation,
      commandId,
      ok: true,
      startedAt,
      stages,
      matterId,
    });
    getMatterWorkflowDiagnostics().record(run);

    return { ok: true, matter: snapshot, run };
  }

  archiveMatter(
    matterId: string,
    commandId = "legal.matter.archive",
  ): MatterWorkflowResult {
    const startedAt = performance.now();
    const stages: MatterWorkflowStageRecord[] = [];
    const operation: MatterWorkflowOperation = "archive";
    const repoStart = performance.now();

    const archived = this.options.repository.softArchive(matterId);
    recordStage(stages, operation, "repository", repoStart, Boolean(archived));

    if (!archived) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        matterId,
      });
      getMatterWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalMatterEvent(
      this.options.eventBus,
      "archived",
      toMatterPayload(archived, { commandId }),
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
      matterId,
      eventId: published.eventId,
    });
    getMatterWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      matter: archived,
      eventId: published.eventId,
      run,
    };
  }

  searchMatters(
    criteria: MatterListCriteria,
    commandId = "legal.matter.search",
  ): MatterWorkflowResult<readonly Matter[]> {
    const startedAt = performance.now();
    const stages: MatterWorkflowStageRecord[] = [];
    const operation: MatterWorkflowOperation = "search";
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
    const published = publishLegalMatterEvent(
      this.options.eventBus,
      "viewed",
      {
        matterId: "search",
        matterReference: "SEARCH",
        title: "Matter search",
        clientId: "",
        matterTypeId: "other",
        matterStatus: "open",
        practiceAreaId: "corporate",
        priority: "normal",
        leadAttorneyId: "",
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
    getMatterWorkflowDiagnostics().record(run);

    return {
      ok: true,
      matter: results,
      eventId: published.eventId,
      run,
    };
  }

  private runMutation(
    operation: Extract<MatterWorkflowOperation, "create" | "update">,
    commandId: string,
    values: MatterFormValues,
    mutate: (values: MatterFormValues) => Matter | undefined,
    verb: "created" | "updated",
  ): MatterWorkflowResult {
    const startedAt = performance.now();
    const stages: MatterWorkflowStageRecord[] = [];

    const validationStart = performance.now();
    const validation = validateMatterForm(values);
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
      getMatterWorkflowDiagnostics().record(run);
      return { ok: false, validationErrors: validation.errors, run };
    }

    const factoryStart = performance.now();
    let matter: Matter | undefined;
    try {
      matter = mutate(values);
      recordStage(stages, operation, "factory", factoryStart, Boolean(matter));
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
    recordStage(stages, operation, "repository", repoStart, Boolean(matter));
    if (!matter) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
      });
      getMatterWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalMatterEvent(
      this.options.eventBus,
      verb,
      toMatterPayload(matter, { commandId }),
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
      matterId: matter.matterId,
      eventId: published.eventId,
    });
    getMatterWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      matter,
      eventId: published.eventId,
      run,
    };
  }

  private failure(
    operation: MatterWorkflowOperation,
    commandId: string,
    details: { readonly matterId?: string },
    message: string,
  ): MatterWorkflowResult {
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
      matterId: details.matterId,
    });
    getMatterWorkflowDiagnostics().record(run);
    return { ok: false, run };
  }

  private buildRun(input: {
    readonly operation: MatterWorkflowOperation;
    readonly commandId?: string;
    readonly ok: boolean;
    readonly startedAt: number;
    readonly stages: MatterWorkflowStageRecord[];
    readonly matterId?: string;
    readonly eventId?: string;
    readonly validationErrors?: Readonly<Record<string, string>>;
  }): MatterWorkflowRunRecord {
    return {
      operation: input.operation,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - input.startedAt,
      ok: input.ok,
      commandId: input.commandId,
      eventId: input.eventId,
      matterId: input.matterId,
      validationErrors: input.validationErrors,
      stages: input.stages,
    };
  }
}
