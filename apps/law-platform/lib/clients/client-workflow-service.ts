import type { EventBus } from "@apzhub/event-notification-framework";
import {
  ClientFactory,
  type Client,
  type ClientSearchCriteria,
} from "@apzhub/legal-business-core";

import { publishLegalClientEvent } from "../publish-legal-client-event";
import type { ClientFormValues } from "./client-types";
import {
  getClientWorkflowDiagnostics,
  type ClientWorkflowOperation,
  type ClientWorkflowRunRecord,
  type ClientWorkflowStageRecord,
} from "./client-workflow-diagnostics";
import {
  parseCustomFieldsInput,
  parseTagsInput,
  validateClientForm,
} from "./client-validation";
import type { WritableClientRepository } from "./writable-client-repository";

export interface ClientWorkflowServiceOptions {
  readonly repository: WritableClientRepository;
  readonly eventBus: EventBus;
  readonly actorId?: string;
}

export interface ClientWorkflowResult<T = Client> {
  readonly ok: boolean;
  readonly client?: T;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly eventId?: string;
  readonly run: ClientWorkflowRunRecord;
}

function recordStage(
  stages: ClientWorkflowStageRecord[],
  operation: ClientWorkflowOperation,
  stage: ClientWorkflowStageRecord["stage"],
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

function toClientPayload(client: Client, extras: Record<string, string> = {}) {
  return {
    clientId: client.clientId,
    clientReference: client.clientReference,
    displayName: client.displayName,
    clientType: client.clientType,
    status: client.status,
    ...extras,
  };
}

/** Complete in-memory client workflow — validate, factory, repository, events (LAW-002-03). */
export class ClientWorkflowService {
  constructor(private readonly options: ClientWorkflowServiceOptions) {}

  createClient(
    values: ClientFormValues,
    commandId = "legal.client.create",
  ): ClientWorkflowResult {
    return this.runMutation(
      "create",
      commandId,
      values,
      (validated) => {
        const client = ClientFactory.create({
          displayName: validated.displayName,
          clientType: validated.clientType,
          status: validated.status,
          clientReference: validated.clientReference.trim() || undefined,
          tags: parseTagsInput(validated.tags),
          customFields: parseCustomFieldsInput(validated.customFields),
        });

        return this.options.repository.create(client);
      },
      "created",
    );
  }

  updateClient(
    clientId: string,
    values: ClientFormValues,
    commandId = "legal.client.edit",
  ): ClientWorkflowResult {
    const existing = this.options.repository.getById(clientId);
    if (!existing) {
      return this.failure("update", commandId, { clientId }, "Client not found.");
    }

    return this.runMutation(
      "update",
      commandId,
      values,
      (validated) => {
        const updated: Client = {
          ...existing,
          displayName: validated.displayName.trim(),
          clientType: validated.clientType,
          status: validated.status,
          clientReference:
            validated.clientReference.trim().length > 0
              ? validated.clientReference.trim()
              : existing.clientReference,
          primaryContactId: validated.primaryContactId.trim() || undefined,
          billingAddressId: validated.billingAddressId.trim() || undefined,
          tags: parseTagsInput(validated.tags),
          customFields: parseCustomFieldsInput(validated.customFields),
        };

        return this.options.repository.update(clientId, updated);
      },
      "updated",
    );
  }

  openClient(clientId: string, commandId = "legal.client.open"): ClientWorkflowResult {
    const startedAt = performance.now();
    const stages: ClientWorkflowStageRecord[] = [];
    const operation: ClientWorkflowOperation = "open";
    const stageStart = performance.now();

    const client = this.options.repository.getById(clientId);
    recordStage(
      stages,
      operation,
      "repository",
      stageStart,
      Boolean(client),
      client?.clientReference,
    );

    if (!client) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        clientId,
      });
      getClientWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalClientEvent(
      this.options.eventBus,
      "viewed",
      toClientPayload(client, { commandId }),
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
      clientId,
      eventId: published.eventId,
    });
    getClientWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      client,
      eventId: published.eventId,
      run,
    };
  }

  deleteClient(
    clientId: string,
    commandId = "legal.client.delete",
  ): ClientWorkflowResult {
    const startedAt = performance.now();
    const stages: ClientWorkflowStageRecord[] = [];
    const operation: ClientWorkflowOperation = "delete";
    const repoStart = performance.now();

    const deleted = this.options.repository.softDelete(clientId);
    recordStage(stages, operation, "repository", repoStart, Boolean(deleted));

    if (!deleted) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        clientId,
      });
      getClientWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalClientEvent(
      this.options.eventBus,
      "deleted",
      toClientPayload(deleted, { commandId }),
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
      clientId,
      eventId: published.eventId,
    });
    getClientWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      client: deleted,
      eventId: published.eventId,
      run,
    };
  }

  searchClients(
    criteria: ClientSearchCriteria,
    commandId = "legal.client.search",
  ): ClientWorkflowResult<readonly Client[]> {
    const startedAt = performance.now();
    const stages: ClientWorkflowStageRecord[] = [];
    const operation: ClientWorkflowOperation = "search";
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
    const published = publishLegalClientEvent(
      this.options.eventBus,
      "viewed",
      {
        clientId: "search",
        clientReference: "SEARCH",
        displayName: "Client search",
        clientType: "organisation",
        status: "active",
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
    getClientWorkflowDiagnostics().record(run);

    return {
      ok: true,
      client: results,
      eventId: published.eventId,
      run,
    };
  }

  private runMutation(
    operation: Extract<ClientWorkflowOperation, "create" | "update">,
    commandId: string,
    values: ClientFormValues,
    mutate: (values: ClientFormValues) => Client | undefined,
    verb: "created" | "updated",
  ): ClientWorkflowResult {
    const startedAt = performance.now();
    const stages: ClientWorkflowStageRecord[] = [];

    const validationStart = performance.now();
    const validation = validateClientForm(values);
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
      getClientWorkflowDiagnostics().record(run);
      return { ok: false, validationErrors: validation.errors, run };
    }

    const factoryStart = performance.now();
    let client: Client | undefined;
    try {
      client = mutate(values);
      recordStage(stages, operation, "factory", factoryStart, Boolean(client));
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
    recordStage(stages, operation, "repository", repoStart, Boolean(client));
    if (!client) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
      });
      getClientWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalClientEvent(
      this.options.eventBus,
      verb,
      toClientPayload(client, { commandId }),
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
      clientId: client.clientId,
      eventId: published.eventId,
    });
    getClientWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      client,
      eventId: published.eventId,
      run,
    };
  }

  private failure(
    operation: ClientWorkflowOperation,
    commandId: string,
    details: { readonly clientId?: string },
    message: string,
  ): ClientWorkflowResult {
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
      clientId: details.clientId,
    });
    getClientWorkflowDiagnostics().record(run);
    return { ok: false, run };
  }

  private buildRun(input: {
    readonly operation: ClientWorkflowOperation;
    readonly commandId?: string;
    readonly ok: boolean;
    readonly startedAt: number;
    readonly stages: ClientWorkflowStageRecord[];
    readonly clientId?: string;
    readonly eventId?: string;
    readonly validationErrors?: Readonly<Record<string, string>>;
  }): ClientWorkflowRunRecord {
    return {
      operation: input.operation,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - input.startedAt,
      ok: input.ok,
      commandId: input.commandId,
      eventId: input.eventId,
      clientId: input.clientId,
      validationErrors: input.validationErrors,
      stages: input.stages,
    };
  }
}
