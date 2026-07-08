export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  INVOICE_CANCEL_AUTH,
  INVOICE_READ_AUTH,
  INVOICE_UPDATE_AUTH,
  handleCancelInvoice,
  handleGetInvoice,
  handleUpdateInvoice,
} from "@/lib/api/invoices";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "PATCH", "DELETE"] as const;

type RouteContext = { params: Promise<{ invoiceId: string }> };

async function resolveInvoiceId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.invoiceId;
}

export async function GET(request: NextRequest, routeContext: RouteContext) {
  const invoiceId = await resolveInvoiceId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleGetInvoice(req, ctx, invoiceId),
    INVOICE_READ_AUTH,
  )(request);
}

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  const invoiceId = await resolveInvoiceId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleUpdateInvoice(req, ctx, invoiceId),
    INVOICE_UPDATE_AUTH,
  )(request);
}

export async function DELETE(request: NextRequest, routeContext: RouteContext) {
  const invoiceId = await resolveInvoiceId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleCancelInvoice(req, ctx, invoiceId),
    INVOICE_CANCEL_AUTH,
  )(request);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "POST",
  );
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "PUT",
  );
}
