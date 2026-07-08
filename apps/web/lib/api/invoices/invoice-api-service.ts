import {
  createPlaceholderEventBus,
  type EventBus,
} from "@apzhub/event-notification-framework";
import type { ManagedInvoice } from "@apzhub/law-platform/api";

import {
  InvoiceWorkflowService,
  createEmptyInvoiceFormValues,
  getLawRepositoryMode,
  getSharedInvoiceRepository,
  invoiceToFormValues,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { createWorkflowRunner } from "../framework";
import type {
  CreateInvoiceV1Request,
  UpdateInvoiceV1Request,
} from "./invoice-dto-mapper";
import {
  getInvoiceApiMetadata,
  lineItemsToTimeEntryIdsInput,
  resolveInvoiceMatterIdFromRequest,
  touchInvoiceApiMetadata,
} from "./invoice-dto-mapper";

let invoiceApiEventBus: EventBus | undefined;

export function getInvoiceApiEventBus(): EventBus {
  invoiceApiEventBus ??= createPlaceholderEventBus();
  return invoiceApiEventBus;
}

export function resetInvoiceApiEventBus(): void {
  invoiceApiEventBus = undefined;
}

const invoiceWorkflowRunner = createWorkflowRunner({
  createService: (context) =>
    new InvoiceWorkflowService({
      repository: getSharedInvoiceRepository(),
      eventBus: getInvoiceApiEventBus(),
      actorId: context.user?.userId,
    }),
});

export function createInvoiceWorkflowService(
  context: LawApiAuthenticatedContext,
): InvoiceWorkflowService {
  return invoiceWorkflowRunner.createService(context);
}

export async function withInvoiceWorkflowService<T>(
  context: LawApiAuthenticatedContext,
  operation: (service: InvoiceWorkflowService) => T | Promise<T>,
): Promise<T> {
  return invoiceWorkflowRunner.withService(context, operation);
}

export function createInvoiceFormValuesFromRequest(body: CreateInvoiceV1Request) {
  const matterId = resolveInvoiceMatterIdFromRequest(body.matterId, body.lineItems);

  return {
    ...createEmptyInvoiceFormValues(matterId, body.clientId),
    clientId: body.clientId,
    matterId,
    issueDate: body.issueDate,
    dueDate: body.dueDate,
    timeEntryIds: lineItemsToTimeEntryIdsInput(body.lineItems),
  };
}

export function mergeUpdateInvoiceFormValues(
  existing: ManagedInvoice,
  body: UpdateInvoiceV1Request,
) {
  const current = invoiceToFormValues(existing);

  return {
    ...current,
    dueDate: body.dueDate ?? current.dueDate,
    timeEntryIds:
      body.lineItems !== undefined
        ? lineItemsToTimeEntryIdsInput(body.lineItems)
        : current.timeEntryIds,
    matterId:
      body.lineItems !== undefined && body.lineItems.length > 0
        ? body.lineItems[0]!.matterId
        : current.matterId,
  };
}

export function recordInvoiceMetadataAfterWrite(
  invoice: ManagedInvoice,
  created: boolean,
) {
  if (getLawRepositoryMode() === "postgres") {
    return;
  }

  touchInvoiceApiMetadata(invoice.invoiceId, created);
}

export function resolveInvoiceMetadata(invoiceId: string) {
  return getInvoiceApiMetadata(invoiceId);
}
