import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import {
  createLawApiController,
  createdResponse,
  defineResourceAuth,
  internalErrorResponse,
  malformedRequestResponse,
  notFoundResponse,
  paginatedResponse,
  successResponse,
  validationErrorResponse,
} from "../framework";
import { parseJsonBody } from "../validation";
import {
  createLawPersistenceContext,
  getLawRepositoryMode,
} from "@apzhub/law-platform/api";
import type { TrustReportType } from "@apzhub/law-platform/api";
import {
  exportTrustReport,
  isTrustReportExportPlaceholderFormat,
  normalizeTrustReportExportFormat,
  type TrustReportExportFormat,
} from "@apzhub/law-platform/api";
import {
  TRUST_AUTH,
  LAW_API_TRUST_INTEREST_PERMISSION,
  LAW_API_TRUST_MANAGE_PERMISSION,
  LAW_API_TRUST_POST_PERMISSION,
  LAW_API_TRUST_REPORT_PERMISSION,
  LAW_API_TRUST_REVERSE_PERMISSION,
  LAW_API_TRUST_TRANSFER_PERMISSION,
  LAW_API_TRUST_VIEW_PERMISSION,
} from "./trust-api-permissions";
import { withTrustServiceBundle } from "./trust-api-service";
import {
  mapTrustAccountToSummaryV1,
  mapTrustBalanceToSummaryV1,
  mapTrustTransactionToSummaryV1,
  type CreateTrustAccountV1Request,
  type CreateTrustTransactionDraftV1Request,
  type TrustAccountDetailV1,
} from "./trust-dto-mapper";
import type { LawApiPaginationMeta } from "../framework";

function resolveTrustTenantId(context: LawApiAuthenticatedContext): string {
  return createLawPersistenceContext({
    tenantId: context.tenantId,
    actorId: context.user?.userId,
  }).tenantId;
}

function trustPagination(count: number): LawApiPaginationMeta {
  return {
    limit: count || 1,
    hasMore: false,
    nextCursor: null,
    prevCursor: null,
    totalCount: count,
  };
}

async function handleListTrustAccountsImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  return withTrustServiceBundle(context, (bundle) => {
    const accounts = bundle.ledgerService.listAccounts(resolveTrustTenantId(context));
    return paginatedResponse(
      accounts.map(mapTrustAccountToSummaryV1),
      trustPagination(accounts.length),
      context,
    );
  });
}

async function handleGetTrustAccountImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  trustAccountId: string,
): Promise<NextResponse> {
  return withTrustServiceBundle(context, (bundle) => {
    const account = bundle.ledgerService.getAccount(
      resolveTrustTenantId(context),
      trustAccountId,
    );
    if (!account) {
      return notFoundResponse(context, "Trust account not found.");
    }

    const balances = bundle.ledgerService.getBalances(
      resolveTrustTenantId(context),
      trustAccountId,
    );
    const detail: TrustAccountDetailV1 = {
      ...mapTrustAccountToSummaryV1(account),
      balances: balances.map(mapTrustBalanceToSummaryV1),
    };
    return successResponse(detail, context);
  });
}

async function handleCreateTrustAccountImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as CreateTrustAccountV1Request;
  if (!body.name?.trim() || !body.currency?.trim()) {
    return validationErrorResponse(context, { name: "name and currency are required" });
  }

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.ledgerService.openAccount({
      tenantId: resolveTrustTenantId(context),
      name: body.name.trim(),
      currency: body.currency.trim(),
      institutionName: body.institutionName?.trim() || "Trust Bank",
      accountNumberMasked: body.accountNumberMasked?.trim() || "****0000",
      actorUserId: context.user?.userId ?? "system",
    });

    if (!result.ok || !result.data) {
      return internalErrorResponse(
        context,
        result.error?.message ?? "Failed to open trust account",
      );
    }

    return createdResponse(mapTrustAccountToSummaryV1(result.data), context);
  });
}

async function handleListTrustTransactionsImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const trustAccountId = request.nextUrl.searchParams.get("trustAccountId")?.trim();
  if (!trustAccountId) {
    return malformedRequestResponse(
      context,
      "trustAccountId query parameter is required.",
    );
  }

  return withTrustServiceBundle(context, (bundle) => {
    const transactions = bundle.repositories.ledgerRepository.listTransactions(
      resolveTrustTenantId(context),
      trustAccountId,
    );
    return paginatedResponse(
      transactions.map(mapTrustTransactionToSummaryV1),
      trustPagination(transactions.length),
      context,
    );
  });
}

async function handleCreateTrustTransactionDraftImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as CreateTrustTransactionDraftV1Request;
  if (!body.trustAccountId || !body.amount || !body.clientId) {
    return validationErrorResponse(context, {
      trustAccountId: "trustAccountId, amount, and clientId are required",
    });
  }

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.workflowService.createDraft({
      tenantId: resolveTrustTenantId(context),
      trustAccountId: body.trustAccountId,
      trustTransactionType: body.trustTransactionType as "deposit",
      amount: body.amount,
      currency: body.currency,
      transactionDate: body.transactionDate,
      postingDate: body.postingDate,
      clientId: body.clientId,
      matterId: body.matterId,
      narrative: body.narrative,
      adjustmentDirection: body.adjustmentDirection,
      actorUserId: context.user?.userId ?? "system",
    });

    if (!result.ok || !result.draft) {
      return validationErrorResponse(context, {
        draft: result.error?.message ?? "Draft creation failed",
      });
    }

    return createdResponse(result.draft, context);
  });
}

async function handlePostTrustTransactionDraftImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  draftId: string,
): Promise<NextResponse> {
  return withTrustServiceBundle(context, (bundle) => {
    const draft = bundle.workflowService.getDraft(
      resolveTrustTenantId(context),
      draftId,
    );
    if (!draft) {
      return notFoundResponse(context, "Trust transaction draft not found.");
    }

    if (draft.status === "draft") {
      const validated = bundle.workflowService.validateDraft(
        resolveTrustTenantId(context),
        draftId,
        context.user?.userId ?? "system",
      );
      if (!validated.ok) {
        return validationErrorResponse(context, {
          draft: validated.error?.message ?? "Validation failed",
        });
      }
    }

    const posted = bundle.workflowService.postDraft({
      tenantId: resolveTrustTenantId(context),
      draftId,
      actorUserId: context.user?.userId ?? "system",
    });

    if (!posted.ok) {
      return validationErrorResponse(context, {
        post: posted.error?.message ?? "Post failed",
      });
    }

    return successResponse(
      {
        draft: posted.draft,
        transaction: posted.transaction
          ? mapTrustTransactionToSummaryV1(posted.transaction)
          : undefined,
      },
      context,
    );
  });
}

async function handleListTrustTransfersImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  return withTrustServiceBundle(context, (bundle) => {
    const transfers = bundle.transferService.listTransfers({
      tenantId: resolveTrustTenantId(context),
    });
    return paginatedResponse(transfers, trustPagination(transfers.length), context);
  });
}

async function handleListTrustApprovalsImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  return withTrustServiceBundle(context, (bundle) => {
    const requests = bundle.approvalService.listRequests({
      tenantId: resolveTrustTenantId(context),
    });
    return paginatedResponse(requests, trustPagination(requests.length), context);
  });
}

async function handleListTrustReportsImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  return withTrustServiceBundle(context, (bundle) => {
    const reports = bundle.reportingService.listReports({
      tenantId: resolveTrustTenantId(context),
    });
    return paginatedResponse(
      reports.map((report) => ({
        reportId: report.reportId,
        reportType: report.reportType,
        trustAccountId: report.trustAccountId,
        generatedAt: report.generatedAt,
      })),
      trustPagination(reports.length),
      context,
    );
  });
}

async function handleTrustDiagnosticsImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  return withTrustServiceBundle(context, (bundle) => {
    const accounts = bundle.ledgerService.listAccounts(resolveTrustTenantId(context));
    const snapshot = bundle.approvalService.buildDiagnosticsSnapshot(
      resolveTrustTenantId(context),
    );
    return successResponse(
      {
        repositoryMode: getLawRepositoryMode(),
        accountCount: accounts.length,
        pendingApprovals: snapshot.pendingApprovals,
        diagnostics: snapshot,
      },
      context,
    );
  });
}

async function handleRunTrustReconciliationImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const trustAccountId = request.nextUrl.searchParams.get("trustAccountId")?.trim();
  if (!trustAccountId) {
    return malformedRequestResponse(
      context,
      "trustAccountId query parameter is required.",
    );
  }

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.reconciliationService.runReconciliation({
      tenantId: resolveTrustTenantId(context),
      trustAccountId,
      actorUserId: context.user?.userId ?? "system",
    });

    if (!result.ok || !result.result) {
      return validationErrorResponse(context, {
        reconciliation: result.error?.message ?? "Reconciliation failed",
      });
    }

    return successResponse(result.result, context);
  });
}

async function handleListTrustAllocationsImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const trustAccountId = request.nextUrl.searchParams.get("trustAccountId")?.trim();
  const trustTransactionId = request.nextUrl.searchParams
    .get("trustTransactionId")
    ?.trim();

  return withTrustServiceBundle(context, (bundle) => {
    const allocations = bundle.allocationService.getAllocationHistory({
      tenantId: resolveTrustTenantId(context),
      trustAccountId: trustAccountId || undefined,
      trustTransactionId: trustTransactionId || undefined,
    });
    return paginatedResponse(allocations, trustPagination(allocations.length), context);
  });
}

async function handleListTrustInterestPostingsImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const trustAccountId = request.nextUrl.searchParams.get("trustAccountId")?.trim();

  return withTrustServiceBundle(context, (bundle) => {
    const postings = bundle.interestService.listPostings({
      tenantId: resolveTrustTenantId(context),
      trustAccountId: trustAccountId || undefined,
    });
    return paginatedResponse(postings, trustPagination(postings.length), context);
  });
}

async function handleRunTrustInterestAccrualImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as {
    trustAccountId?: string;
    trustInterestRuleId?: string;
    periodStart?: string;
    periodEnd?: string;
  };

  if (
    !body.trustAccountId ||
    !body.trustInterestRuleId ||
    !body.periodStart ||
    !body.periodEnd
  ) {
    return validationErrorResponse(context, {
      interest:
        "trustAccountId, trustInterestRuleId, periodStart, and periodEnd are required",
    });
  }

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.interestService.runAccrual({
      tenantId: resolveTrustTenantId(context),
      trustAccountId: body.trustAccountId!,
      trustInterestRuleId: body.trustInterestRuleId!,
      periodStart: body.periodStart!,
      periodEnd: body.periodEnd!,
      actorUserId: context.user?.userId ?? "system",
    });

    if (!result.ok || !result.data) {
      return validationErrorResponse(context, {
        interest: result.error?.message ?? "Interest accrual failed",
      });
    }

    return createdResponse(result.data, context);
  });
}

async function handleCreateTrustTransferImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as {
    sourceTrustAccountId?: string;
    destinationTrustAccountId?: string;
    sourceClientId?: string;
    destinationClientId?: string;
    amount?: number;
    currency?: string;
    reason?: string;
    sourceMatterId?: string;
    destinationMatterId?: string;
  };

  if (
    !body.sourceTrustAccountId ||
    !body.sourceClientId ||
    !body.destinationClientId ||
    !body.amount ||
    !body.currency
  ) {
    return validationErrorResponse(context, {
      transfer:
        "sourceTrustAccountId, sourceClientId, destinationClientId, amount, and currency are required",
    });
  }

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.transferService.createTransferDraft({
      tenantId: resolveTrustTenantId(context),
      sourceTrustAccountId: body.sourceTrustAccountId!,
      destinationTrustAccountId: body.destinationTrustAccountId,
      sourceClientId: body.sourceClientId!,
      destinationClientId: body.destinationClientId!,
      sourceMatterId: body.sourceMatterId,
      destinationMatterId: body.destinationMatterId,
      amount: body.amount!,
      currency: body.currency!,
      reason: body.reason?.trim() || "API transfer",
      actorUserId: context.user?.userId ?? "system",
    });

    if (!result.ok || !result.data) {
      return validationErrorResponse(context, {
        transfer: result.error?.message ?? "Transfer draft creation failed",
      });
    }

    return createdResponse(result.data, context);
  });
}

async function handleApproveTrustApprovalImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  trustApprovalRequestId: string,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = (bodyResult.value ?? {}) as { reason?: string };

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.approvalService.approve({
      tenantId: resolveTrustTenantId(context),
      trustApprovalRequestId,
      actorUserId: context.user?.userId ?? "system",
      actorRoles: context.roles,
      reason: body.reason,
    });

    if (!result.ok || !result.data) {
      return validationErrorResponse(context, {
        approval: result.error?.message ?? "Approval failed",
      });
    }

    return successResponse(result.data, context);
  });
}

async function handleRejectTrustApprovalImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  trustApprovalRequestId: string,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as { reason?: string };
  if (!body.reason?.trim()) {
    return validationErrorResponse(context, { reason: "reason is required" });
  }

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.approvalService.reject({
      tenantId: resolveTrustTenantId(context),
      trustApprovalRequestId,
      actorUserId: context.user?.userId ?? "system",
      actorRoles: context.roles,
      reason: body.reason!.trim(),
    });

    if (!result.ok || !result.data) {
      return validationErrorResponse(context, {
        approval: result.error?.message ?? "Rejection failed",
      });
    }

    return successResponse(result.data, context);
  });
}

async function handleRequestTrustReversalImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  trustTransactionId: string,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as {
    trustAccountId?: string;
    postingDate?: string;
    narrative?: string;
  };

  if (!body.trustAccountId || !body.postingDate || !body.narrative?.trim()) {
    return validationErrorResponse(context, {
      reversal: "trustAccountId, postingDate, and narrative are required",
    });
  }

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.workflowService.requestReversal({
      tenantId: resolveTrustTenantId(context),
      trustAccountId: body.trustAccountId!,
      trustTransactionId,
      postingDate: body.postingDate!,
      narrative: body.narrative!.trim(),
      actorUserId: context.user?.userId ?? "system",
    });

    if (!result.ok || !result.draft) {
      return validationErrorResponse(context, {
        reversal: result.error?.message ?? "Reversal request failed",
      });
    }

    return createdResponse(result.draft, context);
  });
}

async function handleGenerateTrustReportImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as {
    reportType?: string;
    trustAccountId?: string;
  };

  if (!body.reportType?.trim() || !body.trustAccountId?.trim()) {
    return validationErrorResponse(context, {
      report: "reportType and trustAccountId are required",
    });
  }

  return withTrustServiceBundle(context, (bundle) => {
    const result = bundle.reportingService.generateReport({
      tenantId: resolveTrustTenantId(context),
      reportType: body.reportType!.trim() as TrustReportType,
      trustAccountId: body.trustAccountId!.trim(),
      generatedByUserId: context.user?.userId ?? "system",
    });

    if (!result.ok || !result.data) {
      return validationErrorResponse(context, {
        report: result.error?.message ?? "Report generation failed",
      });
    }

    return createdResponse(
      {
        reportId: result.data.reportId,
        reportType: result.data.reportType,
        trustAccountId: result.data.trustAccountId,
        generatedAt: result.data.generatedAt,
      },
      context,
    );
  });
}

async function handleExportTrustReportImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  reportId: string,
): Promise<NextResponse> {
  const formatParam = request.nextUrl.searchParams.get("format");
  const format = normalizeTrustReportExportFormat(formatParam);

  if (!format) {
    return validationErrorResponse(context, {
      format: formatParam
        ? "Unsupported export format. Supported values: csv, html."
        : "format query parameter is required (csv or html).",
    });
  }

  if (isTrustReportExportPlaceholderFormat(format)) {
    return validationErrorResponse(context, {
      format: "PDF export is not available in this release.",
    });
  }

  return withTrustServiceBundle(context, (bundle) => {
    const tenantId = resolveTrustTenantId(context);
    const report = bundle.reportingService.getReport(tenantId, reportId);

    if (!report || report.tenantId !== tenantId) {
      return notFoundResponse(context, "Trust report not found.");
    }

    const artifact = exportTrustReport(report, format as TrustReportExportFormat);
    return new NextResponse(artifact.content, {
      status: 200,
      headers: {
        "Content-Type": artifact.mimeType,
        "Content-Disposition": `${artifact.disposition}; filename="${artifact.filename}"`,
        "X-Correlation-Id": context.correlationId,
        "X-Request-Id": context.requestId,
      },
    });
  });
}

export const handleListTrustAccounts = createLawApiController(
  handleListTrustAccountsImpl,
);
export const handleCreateTrustAccount = createLawApiController(
  handleCreateTrustAccountImpl,
);
export const handleListTrustTransactions = createLawApiController(
  handleListTrustTransactionsImpl,
);
export const handleCreateTrustTransactionDraft = createLawApiController(
  handleCreateTrustTransactionDraftImpl,
);
export const handleListTrustTransfers = createLawApiController(
  handleListTrustTransfersImpl,
);
export const handleListTrustApprovals = createLawApiController(
  handleListTrustApprovalsImpl,
);
export const handleListTrustReports = createLawApiController(
  handleListTrustReportsImpl,
);
export const handleTrustDiagnostics = createLawApiController(
  handleTrustDiagnosticsImpl,
);
export const handleRunTrustReconciliation = createLawApiController(
  handleRunTrustReconciliationImpl,
);
export const handleListTrustAllocations = createLawApiController(
  handleListTrustAllocationsImpl,
);
export const handleListTrustInterestPostings = createLawApiController(
  handleListTrustInterestPostingsImpl,
);
export const handleRunTrustInterestAccrual = createLawApiController(
  handleRunTrustInterestAccrualImpl,
);
export const handleCreateTrustTransfer = createLawApiController(
  handleCreateTrustTransferImpl,
);
export const handleGenerateTrustReport = createLawApiController(
  handleGenerateTrustReportImpl,
);

export async function handleGetTrustAccount(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  trustAccountId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleGetTrustAccountImpl(req, ctx, trustAccountId),
    { operation: "getTrustAccount" },
  )(request, context);
}

export async function handlePostTrustTransactionDraft(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  draftId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handlePostTrustTransactionDraftImpl(req, ctx, draftId),
    { operation: "postTrustTransactionDraft" },
  )(request, context);
}

export async function handleApproveTrustApproval(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  trustApprovalRequestId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleApproveTrustApprovalImpl(req, ctx, trustApprovalRequestId),
    { operation: "approveTrustApproval" },
  )(request, context);
}

export async function handleRejectTrustApproval(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  trustApprovalRequestId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleRejectTrustApprovalImpl(req, ctx, trustApprovalRequestId),
    { operation: "rejectTrustApproval" },
  )(request, context);
}

export async function handleRequestTrustReversal(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  trustTransactionId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleRequestTrustReversalImpl(req, ctx, trustTransactionId),
    { operation: "requestTrustReversal" },
  )(request, context);
}

export async function handleExportTrustReport(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  reportId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleExportTrustReportImpl(req, ctx, reportId),
    { operation: "exportTrustReport" },
  )(request, context);
}

const trustAuthPresets = defineResourceAuth({
  view: TRUST_AUTH.view,
  create: TRUST_AUTH.manage,
  edit: TRUST_AUTH.manage,
  delete: TRUST_AUTH.manage,
});

export const TRUST_LIST_AUTH = trustAuthPresets.list;
export const TRUST_READ_AUTH = trustAuthPresets.read;
export const TRUST_CREATE_AUTH = trustAuthPresets.create;
export const TRUST_POST_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_TRUST_POST_PERMISSION,
};
export const TRUST_RECONCILE_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: TRUST_AUTH.reconcile,
};
export const TRUST_DIAGNOSTICS_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_TRUST_VIEW_PERMISSION,
};
export const TRUST_TRANSFER_CREATE_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_TRUST_TRANSFER_PERMISSION,
};
export const TRUST_INTEREST_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_TRUST_INTEREST_PERMISSION,
};
export const TRUST_REPORT_CREATE_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_TRUST_REPORT_PERMISSION,
};
export const TRUST_REPORT_EXPORT_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_TRUST_REPORT_PERMISSION,
};
export const TRUST_REVERSE_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_TRUST_REVERSE_PERMISSION,
};
export const TRUST_APPROVAL_ACTION_AUTH = {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_TRUST_MANAGE_PERMISSION,
};
