/**
 * Law workflow Search publication wiring (Platform-1.3-ENG-001).
 */

import type { Client, Document, Matter, Task } from "@apzhub/legal-business-core";
import {
  enqueueProductPublicationSafely,
  type PublicationDispatcher,
} from "@apzhub/search-orchestrator";
import {
  LawSearchEntityMapper,
  type LawSearchPublicationContext,
} from "@apzhub/search-law";

import type {
  ClientWorkflowResult,
  ClientWorkflowService,
} from "../clients/client-workflow-service";
import type {
  DocumentWorkflowResult,
  DocumentWorkflowService,
} from "../documents/document-workflow-service";
import type {
  MatterWorkflowResult,
  MatterWorkflowService,
} from "../matters/matter-workflow-service";
import type {
  TaskWorkflowResult,
  TaskWorkflowService,
} from "../tasks/task-workflow-service";
import {
  getLawSearchPublicationRuntime,
  markLawSearchCompositionRegistered,
  scheduleLawSearchPublicationDrain,
} from "./publication-runtime";

export type LawSearchPublicationEnv = {
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly actorUserId?: string;
};

function publicationContext(
  env: LawSearchPublicationEnv,
  correlationId: string,
): LawSearchPublicationContext {
  return {
    correlationId,
    actorUserId: env.actorUserId ?? "law-platform",
    tenantId: env.tenantId ?? "platform",
    organisationId: env.organisationId,
    permissions: ["search.*", "law.*"],
    classification: "confidential",
  };
}

function enqueueLawUpsert(
  dispatcher: PublicationDispatcher,
  env: LawSearchPublicationEnv,
  entityType: "law_matter" | "law_client" | "law_document" | "law_task",
  entity: Matter | Client | Document | Task,
  operation: "publish" | "update",
  mapper: LawSearchEntityMapper,
  correlationId: string,
): void {
  const ctx = publicationContext(env, correlationId);
  try {
    const draft = mapper.map(ctx, { entityType, entity: entity as never });
    void enqueueProductPublicationSafely(
      dispatcher,
      {
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.actorUserId,
      },
      {
        entityId: draft.entityId,
        entityType,
        productId: "law",
        operation,
        payload: draft,
      },
    ).then(() => scheduleLawSearchPublicationDrain());
  } catch {
    /* mapping/validation failures must not break Law mutations */
  }
}

export function wireLawMatterWorkflowSearchPublication(
  service: MatterWorkflowService,
  dispatcher: PublicationDispatcher,
  env: LawSearchPublicationEnv,
  mapper = new LawSearchEntityMapper(),
): MatterWorkflowService {
  const createMatter = service.createMatter.bind(service);
  const updateMatter = service.updateMatter.bind(service);
  const archiveMatter = service.archiveMatter.bind(service);

  return Object.assign(Object.create(Object.getPrototypeOf(service)), service, {
    createMatter(
      values: Parameters<MatterWorkflowService["createMatter"]>[0],
      commandId?: string,
    ): MatterWorkflowResult {
      const result = createMatter(values, commandId);
      if (result.ok && result.matter) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_matter",
          result.matter,
          "publish",
          mapper,
          result.eventId ?? `law-matter-create-${result.matter.matterId}`,
        );
      }
      return result;
    },
    updateMatter(
      matterId: string,
      values: Parameters<MatterWorkflowService["updateMatter"]>[1],
      commandId?: string,
    ): MatterWorkflowResult {
      const result = updateMatter(matterId, values, commandId);
      if (result.ok && result.matter) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_matter",
          result.matter,
          "update",
          mapper,
          result.eventId ?? `law-matter-update-${result.matter.matterId}`,
        );
      }
      return result;
    },
    archiveMatter(matterId: string, commandId?: string): MatterWorkflowResult {
      const result = archiveMatter(matterId, commandId);
      if (result.ok && result.matter) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_matter",
          result.matter,
          "update",
          mapper,
          result.eventId ?? `law-matter-archive-${result.matter.matterId}`,
        );
      }
      return result;
    },
  }) as MatterWorkflowService;
}

export function wireLawClientWorkflowSearchPublication(
  service: ClientWorkflowService,
  dispatcher: PublicationDispatcher,
  env: LawSearchPublicationEnv,
  mapper = new LawSearchEntityMapper(),
): ClientWorkflowService {
  const createClient = service.createClient.bind(service);
  const updateClient = service.updateClient.bind(service);

  return Object.assign(Object.create(Object.getPrototypeOf(service)), service, {
    createClient(
      values: Parameters<ClientWorkflowService["createClient"]>[0],
      commandId?: string,
    ): ClientWorkflowResult {
      const result = createClient(values, commandId);
      if (result.ok && result.client) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_client",
          result.client,
          "publish",
          mapper,
          result.eventId ?? `law-client-create-${result.client.clientId}`,
        );
      }
      return result;
    },
    updateClient(
      clientId: string,
      values: Parameters<ClientWorkflowService["updateClient"]>[1],
      commandId?: string,
    ): ClientWorkflowResult {
      const result = updateClient(clientId, values, commandId);
      if (result.ok && result.client) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_client",
          result.client,
          "update",
          mapper,
          result.eventId ?? `law-client-update-${result.client.clientId}`,
        );
      }
      return result;
    },
  }) as ClientWorkflowService;
}

export function wireLawDocumentWorkflowSearchPublication(
  service: DocumentWorkflowService,
  dispatcher: PublicationDispatcher,
  env: LawSearchPublicationEnv,
  mapper = new LawSearchEntityMapper(),
): DocumentWorkflowService {
  const createDocument = service.createDocument.bind(service);
  const updateDocument = service.updateDocument.bind(service);

  return Object.assign(Object.create(Object.getPrototypeOf(service)), service, {
    createDocument(
      values: Parameters<DocumentWorkflowService["createDocument"]>[0],
      commandId?: string,
    ): DocumentWorkflowResult {
      const result = createDocument(values, commandId);
      if (result.ok && result.document) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_document",
          result.document,
          "publish",
          mapper,
          result.eventId ?? `law-document-create-${result.document.documentId}`,
        );
      }
      return result;
    },
    updateDocument(
      documentId: string,
      values: Parameters<DocumentWorkflowService["updateDocument"]>[1],
      commandId?: string,
    ): DocumentWorkflowResult {
      const result = updateDocument(documentId, values, commandId);
      if (result.ok && result.document) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_document",
          result.document,
          "update",
          mapper,
          result.eventId ?? `law-document-update-${result.document.documentId}`,
        );
      }
      return result;
    },
  }) as DocumentWorkflowService;
}

export function wireLawTaskWorkflowSearchPublication(
  service: TaskWorkflowService,
  dispatcher: PublicationDispatcher,
  env: LawSearchPublicationEnv,
  mapper = new LawSearchEntityMapper(),
): TaskWorkflowService {
  const createTask = service.createTask.bind(service);
  const updateTask = service.updateTask.bind(service);

  return Object.assign(Object.create(Object.getPrototypeOf(service)), service, {
    createTask(
      values: Parameters<TaskWorkflowService["createTask"]>[0],
      commandId?: string,
    ): TaskWorkflowResult {
      const result = createTask(values, commandId);
      if (result.ok && result.task) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_task",
          result.task,
          "publish",
          mapper,
          result.eventId ?? `law-task-create-${result.task.taskId}`,
        );
      }
      return result;
    },
    updateTask(
      taskId: string,
      values: Parameters<TaskWorkflowService["updateTask"]>[1],
      commandId?: string,
    ): TaskWorkflowResult {
      const result = updateTask(taskId, values, commandId);
      if (result.ok && result.task) {
        enqueueLawUpsert(
          dispatcher,
          env,
          "law_task",
          result.task,
          "update",
          mapper,
          result.eventId ?? `law-task-update-${result.task.taskId}`,
        );
      }
      return result;
    },
  }) as TaskWorkflowService;
}

export type WireLawSearchPublicationInput = {
  readonly matterWorkflow: MatterWorkflowService;
  readonly clientWorkflow: ClientWorkflowService;
  readonly documentWorkflow: DocumentWorkflowService;
  readonly taskWorkflow: TaskWorkflowService;
  readonly env?: LawSearchPublicationEnv;
};

/**
 * Wire Law workflows when Search publication runtime is available.
 */
export function wireLawSearchPublication(
  input: WireLawSearchPublicationInput,
): WireLawSearchPublicationInput {
  const runtime = getLawSearchPublicationRuntime();
  if (!runtime) {
    return input;
  }
  const env: LawSearchPublicationEnv = {
    tenantId: process.env.LAW_SEARCH_TENANT_ID ?? "platform",
    organisationId: process.env.LAW_SEARCH_ORGANISATION_ID,
    actorUserId: input.env?.actorUserId ?? "law-platform",
    ...input.env,
  };
  const mapper = new LawSearchEntityMapper();
  markLawSearchCompositionRegistered();
  return {
    matterWorkflow: wireLawMatterWorkflowSearchPublication(
      input.matterWorkflow,
      runtime.dispatcher,
      env,
      mapper,
    ),
    clientWorkflow: wireLawClientWorkflowSearchPublication(
      input.clientWorkflow,
      runtime.dispatcher,
      env,
      mapper,
    ),
    documentWorkflow: wireLawDocumentWorkflowSearchPublication(
      input.documentWorkflow,
      runtime.dispatcher,
      env,
      mapper,
    ),
    taskWorkflow: wireLawTaskWorkflowSearchPublication(
      input.taskWorkflow,
      runtime.dispatcher,
      env,
      mapper,
    ),
  };
}
