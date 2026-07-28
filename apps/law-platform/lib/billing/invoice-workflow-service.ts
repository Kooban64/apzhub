import type { EventBus } from "@apzhub/event-notification-framework";
import { InvoiceFactory } from "@apzhub/legal-business-core";

import { publishLegalBillingEvent } from "../publish-legal-billing-event";
import { composeInvoiceDetail } from "./invoice-composition";
import type { InvoiceDetailComposition } from "./invoice-composition";
import {
  parsePlaceholderAmount,
  parseTimeEntryIdsInput,
  type InvoiceFormValues,
  type InvoiceListCriteria,
  type ManagedInvoice,
} from "./invoice-types";
import {
  getInvoiceWorkflowDiagnostics,
  type InvoiceWorkflowOperation,
  type InvoiceWorkflowRunRecord,
  type InvoiceWorkflowStageRecord,
} from "./invoice-workflow-diagnostics";
import { validateInvoiceForm } from "./invoice-validation";
import { getSharedTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import type { WritableInvoiceRepository } from "./writable-invoice-repository";

export interface InvoiceWorkflowServiceOptions {
  readonly repository: WritableInvoiceRepository;
  readonly eventBus: EventBus;
  readonly actorId?: string;
}

export interface InvoiceWorkflowResult<T = ManagedInvoice> {
  readonly ok: boolean;
  readonly invoice?: T;
  readonly composition?: InvoiceDetailComposition;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly eventId?: string;
  readonly run: InvoiceWorkflowRunRecord;
}

function recordStage(
  stages: InvoiceWorkflowStageRecord[],
  operation: InvoiceWorkflowOperation,
  stage: InvoiceWorkflowStageRecord["stage"],
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

function toInvoicePayload(
  invoice: ManagedInvoice,
  extras: Record<string, string> = {},
) {
  return {
    invoiceId: invoice.invoiceId,
    invoiceReference: invoice.invoiceReference,
    clientId: invoice.clientId,
    matterId: invoice.matterId ?? "",
    invoiceStatus: invoice.invoiceStatus,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    subtotal: invoice.subtotal,
    taxTotal: invoice.taxTotal,
    total: invoice.total,
    currency: invoice.currency,
    ...extras,
  };
}

function buildLineItemsFromForm(values: InvoiceFormValues) {
  const timeRepo = getSharedTimeEntryRepository();
  const matterId = values.matterId.trim();

  return parseTimeEntryIdsInput(values.timeEntryIds).map((timeEntryId) => {
    const entry = timeRepo.getById(timeEntryId)!;
    return {
      description: entry.narrative,
      quantity: entry.durationMinutes / 60,
      unitPrice: entry.rate,
      matterId,
      timeEntryId: entry.timeEntryId,
    };
  });
}

function buildManagedInvoice(
  base: ReturnType<typeof InvoiceFactory.create>,
  values: InvoiceFormValues,
  existing?: ManagedInvoice,
): ManagedInvoice {
  return {
    ...base,
    invoiceId: existing?.invoiceId ?? base.invoiceId,
    invoiceReference:
      values.invoiceReference.trim().length > 0
        ? values.invoiceReference.trim()
        : base.invoiceReference,
    invoiceStatus: existing?.invoiceStatus ?? "draft",
    expensesPlaceholder: parsePlaceholderAmount(values.expensesPlaceholder),
    disbursementsPlaceholder: parsePlaceholderAmount(values.disbursementsPlaceholder),
    notes: values.notes.trim() || undefined,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

/** Complete in-memory invoice workflow — validate, factory, repository, events (LAW-010-01). */
export class InvoiceWorkflowService {
  constructor(private readonly options: InvoiceWorkflowServiceOptions) {}

  createInvoice(
    values: InvoiceFormValues,
    commandId = "legal.invoice.create",
  ): InvoiceWorkflowResult {
    return this.runMutation(
      "create",
      commandId,
      values,
      (validated) => {
        const created = InvoiceFactory.create({
          clientId: validated.clientId.trim(),
          matterId: validated.matterId.trim(),
          issueDate: validated.issueDate,
          dueDate: validated.dueDate,
          lineItems: buildLineItemsFromForm(validated),
          expensesPlaceholder: parsePlaceholderAmount(validated.expensesPlaceholder),
          disbursementsPlaceholder: parsePlaceholderAmount(
            validated.disbursementsPlaceholder,
          ),
          invoiceReference: validated.invoiceReference.trim() || undefined,
          invoiceStatus: "draft",
        });

        return this.options.repository.create(buildManagedInvoice(created, validated));
      },
      "created",
    );
  }

  updateInvoice(
    invoiceId: string,
    values: InvoiceFormValues,
    commandId = "legal.invoice.edit",
  ): InvoiceWorkflowResult {
    const existing = this.options.repository.getById(invoiceId);
    if (!existing) {
      return this.failure("update", commandId, { invoiceId }, "Invoice not found.");
    }

    if (existing.invoiceStatus === "void" || existing.invoiceStatus === "paid") {
      return this.failure(
        "update",
        commandId,
        { invoiceId },
        "Paid or void invoices cannot be edited.",
      );
    }

    return this.runMutation(
      "update",
      commandId,
      values,
      (validated) => {
        const updated = InvoiceFactory.create({
          clientId: validated.clientId.trim(),
          matterId: validated.matterId.trim(),
          issueDate: validated.issueDate,
          dueDate: validated.dueDate,
          lineItems: buildLineItemsFromForm(validated),
          expensesPlaceholder: parsePlaceholderAmount(validated.expensesPlaceholder),
          disbursementsPlaceholder: parsePlaceholderAmount(
            validated.disbursementsPlaceholder,
          ),
          invoiceReference: existing.invoiceReference,
          invoiceStatus: existing.invoiceStatus,
        });

        return this.options.repository.update(
          invoiceId,
          buildManagedInvoice(
            { ...updated, invoiceId: existing.invoiceId },
            validated,
            existing,
          ),
        );
      },
      "updated",
    );
  }

  openInvoice(
    invoiceId: string,
    commandId = "legal.invoice.open",
  ): InvoiceWorkflowResult {
    return this.runReadEvent("open", commandId, invoiceId, "viewed");
  }

  previewInvoice(
    invoiceId: string,
    commandId = "legal.invoice.open",
  ): InvoiceWorkflowResult {
    const startedAt = performance.now();
    const stages: InvoiceWorkflowStageRecord[] = [];
    const operation: InvoiceWorkflowOperation = "preview";
    const stageStart = performance.now();

    const invoice = this.options.repository.getById(invoiceId);
    recordStage(
      stages,
      operation,
      "repository",
      stageStart,
      Boolean(invoice),
      invoice?.invoiceReference,
    );

    if (!invoice) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        invoiceId,
      });
      getInvoiceWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const composition = composeInvoiceDetail(invoice);
    const eventStart = performance.now();
    const published = publishLegalBillingEvent(
      this.options.eventBus,
      "viewed",
      toInvoicePayload(invoice, { commandId, preview: "true" }),
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
      ok: published.ok,
      startedAt,
      stages,
      invoiceId,
      matterId: invoice.matterId,
      eventId: published.eventId,
    });
    getInvoiceWorkflowDiagnostics().record(run);

    return { ok: published.ok, invoice, composition, eventId: published.eventId, run };
  }

  cancelInvoice(
    invoiceId: string,
    commandId = "legal.invoice.cancel",
  ): InvoiceWorkflowResult {
    const startedAt = performance.now();
    const stages: InvoiceWorkflowStageRecord[] = [];
    const operation: InvoiceWorkflowOperation = "cancel";
    const repoStart = performance.now();

    const existing = this.options.repository.getById(invoiceId);
    recordStage(stages, operation, "repository", repoStart, Boolean(existing));

    if (!existing) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        invoiceId,
      });
      getInvoiceWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    if (existing.invoiceStatus === "void" || existing.invoiceStatus === "paid") {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        invoiceId,
      });
      getInvoiceWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const cancelled = this.options.repository.update(invoiceId, {
      ...existing,
      invoiceStatus: "void",
    });
    recordStage(stages, operation, "repository", repoStart, Boolean(cancelled), "void");

    const eventStart = performance.now();
    const published = publishLegalBillingEvent(
      this.options.eventBus,
      "cancelled",
      toInvoicePayload(cancelled!, { commandId }),
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
      invoiceId,
      matterId: cancelled?.matterId,
      eventId: published.eventId,
    });
    getInvoiceWorkflowDiagnostics().record(run);

    return { ok: published.ok, invoice: cancelled, eventId: published.eventId, run };
  }

  markInvoicePaid(
    invoiceId: string,
    commandId = "legal.invoice.mark-paid",
  ): InvoiceWorkflowResult {
    const startedAt = performance.now();
    const stages: InvoiceWorkflowStageRecord[] = [];
    const operation: InvoiceWorkflowOperation = "markPaid";
    const repoStart = performance.now();

    const existing = this.options.repository.getById(invoiceId);
    recordStage(stages, operation, "repository", repoStart, Boolean(existing));

    if (!existing) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        invoiceId,
      });
      getInvoiceWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    if (existing.invoiceStatus === "void" || existing.invoiceStatus === "paid") {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        invoiceId,
      });
      getInvoiceWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const paid = this.options.repository.update(invoiceId, {
      ...existing,
      invoiceStatus: "paid",
    });
    recordStage(stages, operation, "repository", repoStart, Boolean(paid), "paid");

    const eventStart = performance.now();
    const published = publishLegalBillingEvent(
      this.options.eventBus,
      "paid",
      toInvoicePayload(paid!, { commandId }),
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
      invoiceId,
      matterId: paid?.matterId,
      eventId: published.eventId,
    });
    getInvoiceWorkflowDiagnostics().record(run);

    return { ok: published.ok, invoice: paid, eventId: published.eventId, run };
  }

  searchInvoices(
    criteria: InvoiceListCriteria,
    commandId = "legal.invoice.search",
  ): InvoiceWorkflowResult<readonly ManagedInvoice[]> {
    const startedAt = performance.now();
    const stages: InvoiceWorkflowStageRecord[] = [];
    const operation: InvoiceWorkflowOperation = "search";
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
    const published = publishLegalBillingEvent(
      this.options.eventBus,
      "viewed",
      {
        invoiceId: "search",
        invoiceReference: "SEARCH",
        clientId: "",
        matterId: "",
        invoiceStatus: "draft",
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        subtotal: 0,
        taxTotal: 0,
        total: 0,
        currency: "AUD",
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
    getInvoiceWorkflowDiagnostics().record(run);

    return { ok: true, invoice: results, eventId: published.eventId, run };
  }

  private runReadEvent(
    operation: Extract<InvoiceWorkflowOperation, "open">,
    commandId: string,
    invoiceId: string,
    verb: "viewed",
  ): InvoiceWorkflowResult {
    const startedAt = performance.now();
    const stages: InvoiceWorkflowStageRecord[] = [];
    const stageStart = performance.now();

    const invoice = this.options.repository.getById(invoiceId);
    recordStage(
      stages,
      operation,
      "repository",
      stageStart,
      Boolean(invoice),
      invoice?.invoiceReference,
    );

    if (!invoice) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        invoiceId,
      });
      getInvoiceWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalBillingEvent(
      this.options.eventBus,
      verb,
      toInvoicePayload(invoice, { commandId }),
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
      invoiceId,
      matterId: invoice.matterId,
      eventId: published.eventId,
    });
    getInvoiceWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      invoice,
      composition: composeInvoiceDetail(invoice),
      eventId: published.eventId,
      run,
    };
  }

  private runMutation(
    operation: Extract<InvoiceWorkflowOperation, "create" | "update">,
    commandId: string,
    values: InvoiceFormValues,
    mutate: (values: InvoiceFormValues) => ManagedInvoice | undefined,
    verb: "created" | "updated",
  ): InvoiceWorkflowResult {
    const startedAt = performance.now();
    const stages: InvoiceWorkflowStageRecord[] = [];

    const validationStart = performance.now();
    const validation = validateInvoiceForm(values);
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
      getInvoiceWorkflowDiagnostics().record(run);
      return { ok: false, validationErrors: validation.errors, run };
    }

    const factoryStart = performance.now();
    let invoice: ManagedInvoice | undefined;
    try {
      invoice = mutate(values);
      recordStage(stages, operation, "factory", factoryStart, Boolean(invoice));
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
    recordStage(stages, operation, "repository", repoStart, Boolean(invoice));
    if (!invoice) {
      const run = this.buildRun({ operation, commandId, ok: false, startedAt, stages });
      getInvoiceWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalBillingEvent(
      this.options.eventBus,
      verb,
      toInvoicePayload(invoice, { commandId }),
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
      invoiceId: invoice.invoiceId,
      matterId: invoice.matterId,
      eventId: published.eventId,
    });
    getInvoiceWorkflowDiagnostics().record(run);

    return {
      ok: published.ok,
      invoice,
      composition: composeInvoiceDetail(invoice),
      eventId: published.eventId,
      run,
    };
  }

  private failure(
    operation: InvoiceWorkflowOperation,
    commandId: string,
    context: { invoiceId?: string },
    detail: string,
  ): InvoiceWorkflowResult {
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
          durationMs: performance.now() - startedAt,
          detail,
        },
      ],
      invoiceId: context.invoiceId,
    });
    getInvoiceWorkflowDiagnostics().record(run);
    return { ok: false, run };
  }

  private buildRun(input: {
    operation: InvoiceWorkflowOperation;
    commandId: string;
    ok: boolean;
    startedAt: number;
    stages: InvoiceWorkflowStageRecord[];
    invoiceId?: string;
    matterId?: string;
    eventId?: string;
    validationErrors?: Readonly<Record<string, string>>;
  }): InvoiceWorkflowRunRecord {
    return {
      operation: input.operation,
      commandId: input.commandId,
      ok: input.ok,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - input.startedAt,
      invoiceId: input.invoiceId,
      matterId: input.matterId,
      eventId: input.eventId,
      validationErrors: input.validationErrors,
      stages: input.stages,
    };
  }
}
