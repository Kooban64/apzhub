import type { EventBus } from "@apzhub/event-notification-framework";
import { DocumentFactory, type Document } from "@apzhub/legal-business-core";

import { publishLegalDocumentEvent } from "../publish-legal-document-event";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import type { DocumentFormValues, DocumentListCriteria } from "./document-types";
import {
  getDocumentWorkflowDiagnostics,
  type DocumentWorkflowOperation,
  type DocumentWorkflowRunRecord,
  type DocumentWorkflowStageRecord,
} from "./document-workflow-diagnostics";
import {
  parseCustomFieldsInput,
  parseSizeBytesInput,
  parseTagsInput,
  validateDocumentForm,
} from "./document-validation";
import type { WritableDocumentRepository } from "./writable-document-repository";

export interface DocumentWorkflowServiceOptions {
  readonly repository: WritableDocumentRepository;
  readonly eventBus: EventBus;
  readonly actorId?: string;
}

export interface DocumentWorkflowResult<T = Document> {
  readonly ok: boolean;
  readonly document?: T;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly eventId?: string;
  readonly run: DocumentWorkflowRunRecord;
}

function recordStage(
  stages: DocumentWorkflowStageRecord[],
  operation: DocumentWorkflowOperation,
  stage: DocumentWorkflowStageRecord["stage"],
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

function toDocumentPayload(document: Document, extras: Record<string, string> = {}) {
  return {
    documentId: document.documentId,
    documentReference: document.documentReference,
    title: document.title,
    documentType: document.documentType,
    documentStatus: document.documentStatus,
    documentCategoryId: document.documentCategoryId,
    matterId: document.matterId,
    folderId: document.folderId ?? "",
    fileName: document.fileName,
    ...extras,
  };
}

/** Complete in-memory document workflow — validate, factory, repository, events (LAW-004-01). */
export class DocumentWorkflowService {
  constructor(private readonly options: DocumentWorkflowServiceOptions) {}

  createDocument(
    values: DocumentFormValues,
    commandId = "legal.document.create",
  ): DocumentWorkflowResult {
    return this.runMutation(
      "create",
      commandId,
      values,
      (validated) => {
        const matter = getSharedMatterRepository().getById(validated.matterId.trim());
        const created = DocumentFactory.create({
          title: validated.title,
          matterId: validated.matterId.trim(),
          documentCategoryId: validated.documentCategoryId.trim(),
          createdByUserId: validated.createdByUserId.trim() || "user-legal-workbench",
          documentReference: validated.documentReference.trim() || undefined,
          clientId: matter?.clientId,
        });

        const document: Document = {
          ...created,
          documentType: validated.documentType,
          documentStatus: validated.documentStatus,
          folderId: validated.folderId.trim() || undefined,
          fileName: validated.fileName.trim() || created.fileName,
          mimeType: validated.mimeType.trim() || created.mimeType,
          sizeBytes: parseSizeBytesInput(validated.sizeBytes),
          tags: parseTagsInput(validated.tags),
          customFields: parseCustomFieldsInput(validated.customFields),
        };

        return this.options.repository.create(document);
      },
      "created",
    );
  }

  updateDocument(
    documentId: string,
    values: DocumentFormValues,
    commandId = "legal.document.edit",
  ): DocumentWorkflowResult {
    const existing = this.options.repository.getById(documentId);
    if (!existing) {
      return this.failure("update", commandId, { documentId }, "Document not found.");
    }

    return this.runMutation(
      "update",
      commandId,
      values,
      (validated) => {
        const matter = getSharedMatterRepository().getById(validated.matterId.trim());
        const updated: Document = {
          ...existing,
          title: validated.title.trim(),
          documentType: validated.documentType,
          documentStatus: validated.documentStatus,
          documentCategoryId: validated.documentCategoryId.trim(),
          matterId: validated.matterId.trim(),
          clientId: matter?.clientId ?? existing.clientId,
          folderId: validated.folderId.trim() || undefined,
          documentReference:
            validated.documentReference.trim().length > 0
              ? validated.documentReference.trim()
              : existing.documentReference,
          fileName: validated.fileName.trim() || existing.fileName,
          mimeType: validated.mimeType.trim() || existing.mimeType,
          sizeBytes: parseSizeBytesInput(validated.sizeBytes),
          version: existing.version + 1,
          tags: parseTagsInput(validated.tags),
          customFields: parseCustomFieldsInput(validated.customFields),
        };

        return this.options.repository.update(documentId, updated);
      },
      "updated",
    );
  }

  openDocument(
    documentId: string,
    commandId = "legal.document.open",
  ): DocumentWorkflowResult {
    const startedAt = performance.now();
    const stages: DocumentWorkflowStageRecord[] = [];
    const operation: DocumentWorkflowOperation = "open";
    const stageStart = performance.now();

    const document = this.options.repository.getById(documentId);
    recordStage(
      stages,
      operation,
      "repository",
      stageStart,
      Boolean(document),
      document?.documentReference,
    );

    if (!document) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        documentId,
      });
      getDocumentWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalDocumentEvent(
      this.options.eventBus,
      "viewed",
      toDocumentPayload(document, { commandId }),
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
      documentId,
      matterId: document.matterId,
      eventId: published.eventId,
    });
    getDocumentWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      document,
      eventId: published.eventId,
      run,
    };
  }

  archiveDocument(
    documentId: string,
    commandId = "legal.document.archive",
  ): DocumentWorkflowResult {
    const startedAt = performance.now();
    const stages: DocumentWorkflowStageRecord[] = [];
    const operation: DocumentWorkflowOperation = "archive";
    const repoStart = performance.now();

    const archived = this.options.repository.softArchive(documentId);
    recordStage(stages, operation, "repository", repoStart, Boolean(archived));

    if (!archived) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        documentId,
      });
      getDocumentWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalDocumentEvent(
      this.options.eventBus,
      "archived",
      toDocumentPayload(archived, { commandId }),
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
      documentId,
      matterId: archived.matterId,
      eventId: published.eventId,
    });
    getDocumentWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      document: archived,
      eventId: published.eventId,
      run,
    };
  }

  searchDocuments(
    criteria: DocumentListCriteria,
    commandId = "legal.document.search",
  ): DocumentWorkflowResult<readonly Document[]> {
    const startedAt = performance.now();
    const stages: DocumentWorkflowStageRecord[] = [];
    const operation: DocumentWorkflowOperation = "search";
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
    const published = publishLegalDocumentEvent(
      this.options.eventBus,
      "viewed",
      {
        documentId: "search",
        documentReference: "SEARCH",
        title: "Document search",
        documentType: "other",
        documentStatus: "draft",
        documentCategoryId: "correspondence",
        matterId: "",
        folderId: "",
        fileName: "",
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
    getDocumentWorkflowDiagnostics().record(run);

    return {
      ok: true,
      document: results,
      eventId: published.eventId,
      run,
    };
  }

  private runMutation(
    operation: Extract<DocumentWorkflowOperation, "create" | "update">,
    commandId: string,
    values: DocumentFormValues,
    mutate: (values: DocumentFormValues) => Document | undefined,
    verb: "created" | "updated",
  ): DocumentWorkflowResult {
    const startedAt = performance.now();
    const stages: DocumentWorkflowStageRecord[] = [];

    const validationStart = performance.now();
    const validation = validateDocumentForm(values);
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
      getDocumentWorkflowDiagnostics().record(run);
      return { ok: false, validationErrors: validation.errors, run };
    }

    const factoryStart = performance.now();
    let document: Document | undefined;
    try {
      document = mutate(values);
      recordStage(stages, operation, "factory", factoryStart, Boolean(document));
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
    recordStage(stages, operation, "repository", repoStart, Boolean(document));
    if (!document) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
      });
      getDocumentWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalDocumentEvent(
      this.options.eventBus,
      verb,
      toDocumentPayload(document, { commandId }),
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
      documentId: document.documentId,
      matterId: document.matterId,
      eventId: published.eventId,
    });
    getDocumentWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      document,
      eventId: published.eventId,
      run,
    };
  }

  private failure(
    operation: DocumentWorkflowOperation,
    commandId: string,
    details: { readonly documentId?: string },
    message: string,
  ): DocumentWorkflowResult {
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
      documentId: details.documentId,
    });
    getDocumentWorkflowDiagnostics().record(run);
    return { ok: false, run };
  }

  private buildRun(input: {
    readonly operation: DocumentWorkflowOperation;
    readonly commandId?: string;
    readonly ok: boolean;
    readonly startedAt: number;
    readonly stages: DocumentWorkflowStageRecord[];
    readonly documentId?: string;
    readonly matterId?: string;
    readonly eventId?: string;
    readonly validationErrors?: Readonly<Record<string, string>>;
  }): DocumentWorkflowRunRecord {
    return {
      operation: input.operation,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - input.startedAt,
      ok: input.ok,
      commandId: input.commandId,
      eventId: input.eventId,
      documentId: input.documentId,
      matterId: input.matterId,
      validationErrors: input.validationErrors,
      stages: input.stages,
    };
  }
}
