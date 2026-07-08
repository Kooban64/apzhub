import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import type { ManagedInvoice } from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import {
  archivedResponse,
  createLawApiController,
  createdResponse,
  defineResourceAuth,
  ifMatchPreconditionResponse,
  internalErrorResponse,
  malformedRequestResponse,
  notFoundResponse,
  paginatedResponse,
  parseIfMatchVersion,
  successResponse,
  updatedResponse,
  validationErrorResponse,
  workflowValidationToResponse,
} from "../framework";
import { parseJsonBody } from "../validation";
import {
  INVOICE_AUTH,
  LAW_API_INVOICE_CANCEL_PERMISSION,
  LAW_API_INVOICE_CREATE_PERMISSION,
  LAW_API_INVOICE_EDIT_PERMISSION,
  LAW_API_INVOICE_VIEW_PERMISSION,
} from "./invoice-api-permissions";
import {
  mapInvoiceToDetailV1,
  mapInvoiceToSummaryV1,
  type InvoiceCancelResponseV1,
} from "./invoice-dto-mapper";
import {
  createInvoiceFormValuesFromRequest,
  mergeUpdateInvoiceFormValues,
  recordInvoiceMetadataAfterWrite,
  resolveInvoiceMetadata,
  withInvoiceWorkflowService,
} from "./invoice-api-service";
import {
  paginateInvoiceSummaries,
  parseInvoiceListQuery,
  sortInvoicesForApi,
} from "./invoice-query-parser";

function toInvoiceList(results: { invoice?: unknown }): readonly ManagedInvoice[] {
  const raw = results.invoice;
  if (Array.isArray(raw)) {
    return raw;
  }
  return raw ? [raw as ManagedInvoice] : [];
}

async function handleListInvoicesImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const query = parseInvoiceListQuery(request.nextUrl.searchParams);

  return withInvoiceWorkflowService(context, (service) => {
    const results = service.searchInvoices(query.criteria);
    const invoices = sortInvoicesForApi(
      toInvoiceList(results).map((invoice) => ({
        ...invoice,
        createdAt: resolveInvoiceMetadata(invoice.invoiceId).createdAt,
      })),
      query.sort,
    );

    const summaries = invoices.map((invoice) =>
      mapInvoiceToSummaryV1(invoice, resolveInvoiceMetadata(invoice.invoiceId)),
    );
    const { page, pagination } = paginateInvoiceSummaries(
      summaries,
      query.limit,
      query.cursorOffset,
    );

    return paginatedResponse(page, pagination, context);
  });
}

async function handleGetInvoiceImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  invoiceId: string,
): Promise<NextResponse> {
  return withInvoiceWorkflowService(context, (service) => {
    const opened = service.openInvoice(invoiceId);
    if (!opened.invoice || Array.isArray(opened.invoice)) {
      return notFoundResponse(context, "Invoice not found.");
    }

    const metadata = resolveInvoiceMetadata(opened.invoice.invoiceId);
    return successResponse(mapInvoiceToDetailV1(opened.invoice, metadata), context, {
      headers: { ETag: String(metadata.version) },
    });
  });
}

async function handleCreateInvoiceImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as Record<string, unknown>;
  const missing: string[] = [];
  if (typeof body.clientId !== "string" || !body.clientId.trim()) {
    missing.push("clientId");
  }
  if (typeof body.issueDate !== "string" || !body.issueDate.trim()) {
    missing.push("issueDate");
  }
  if (typeof body.dueDate !== "string" || !body.dueDate.trim()) {
    missing.push("dueDate");
  }
  if (!Array.isArray(body.lineItems)) {
    missing.push("lineItems");
  }
  if (missing.length > 0) {
    return malformedRequestResponse(
      context,
      `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required.`,
    );
  }

  if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    return validationErrorResponse(context, {
      lineItems: "At least one line item is required.",
    });
  }

  return withInvoiceWorkflowService(context, (service) => {
    const result = service.createInvoice(
      createInvoiceFormValuesFromRequest(body as never),
    );
    if (result.validationErrors) {
      return workflowValidationToResponse(context, result.validationErrors);
    }

    if (!result.invoice || Array.isArray(result.invoice)) {
      return internalErrorResponse(context, "Invoice could not be created.");
    }

    recordInvoiceMetadataAfterWrite(result.invoice, true);

    return createdResponse(
      mapInvoiceToDetailV1(
        result.invoice,
        resolveInvoiceMetadata(result.invoice.invoiceId),
      ),
      context,
    );
  });
}

async function handleUpdateInvoiceImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  invoiceId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveInvoiceMetadata(invoiceId).version,
  );
  if (precondition) {
    return precondition;
  }

  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  return withInvoiceWorkflowService(context, (service) => {
    const existing = service.openInvoice(invoiceId);
    if (!existing.invoice || Array.isArray(existing.invoice)) {
      return notFoundResponse(context, "Invoice not found.");
    }

    const result = service.updateInvoice(
      invoiceId,
      mergeUpdateInvoiceFormValues(existing.invoice, bodyResult.value as never),
    );

    if (result.validationErrors) {
      return validationErrorResponse(context, result.validationErrors);
    }

    if (!result.invoice || Array.isArray(result.invoice)) {
      return notFoundResponse(context, "Invoice not found.");
    }

    recordInvoiceMetadataAfterWrite(result.invoice, false);
    const metadata = resolveInvoiceMetadata(result.invoice.invoiceId);

    return updatedResponse(mapInvoiceToDetailV1(result.invoice, metadata), context, {
      etag: metadata.version,
    });
  });
}

async function handleCancelInvoiceImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  invoiceId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveInvoiceMetadata(invoiceId).version,
  );
  if (precondition) {
    return precondition;
  }

  return withInvoiceWorkflowService(context, (service) => {
    const result = service.cancelInvoice(invoiceId);
    if (!result.invoice || Array.isArray(result.invoice)) {
      return notFoundResponse(context, "Invoice not found.");
    }

    recordInvoiceMetadataAfterWrite(result.invoice, false);

    const payload: InvoiceCancelResponseV1 = {
      invoiceId: result.invoice.invoiceId,
      status: "cancelled",
    };

    return archivedResponse(payload, context);
  });
}

export const handleListInvoices = createLawApiController(handleListInvoicesImpl, {
  operation: "listInvoices",
});

export async function handleGetInvoice(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  invoiceId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleGetInvoiceImpl(req, ctx, invoiceId),
    { operation: "getInvoice" },
  )(request, context);
}

export const handleCreateInvoice = createLawApiController(handleCreateInvoiceImpl, {
  operation: "createInvoice",
});

export async function handleUpdateInvoice(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  invoiceId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleUpdateInvoiceImpl(req, ctx, invoiceId),
    { operation: "updateInvoice" },
  )(request, context);
}

export async function handleCancelInvoice(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  invoiceId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleCancelInvoiceImpl(req, ctx, invoiceId),
    { operation: "cancelInvoice" },
  )(request, context);
}

const invoiceAuthPresets = defineResourceAuth(INVOICE_AUTH);

export const INVOICE_COLLECTION_AUTH = invoiceAuthPresets.collection;
export const INVOICE_LIST_AUTH = invoiceAuthPresets.list;
export const INVOICE_READ_AUTH = invoiceAuthPresets.read;
export const INVOICE_CREATE_AUTH = invoiceAuthPresets.create;
export const INVOICE_UPDATE_AUTH = invoiceAuthPresets.update;
export const INVOICE_CANCEL_AUTH = invoiceAuthPresets.delete;

export {
  LAW_API_INVOICE_CANCEL_PERMISSION,
  LAW_API_INVOICE_CREATE_PERMISSION,
  LAW_API_INVOICE_EDIT_PERMISSION,
  LAW_API_INVOICE_VIEW_PERMISSION,
};
