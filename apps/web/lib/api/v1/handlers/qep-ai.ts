import type { NextRequest } from "next/server";

import {
  DESTINATION_PERMISSION,
  hasSourceRead,
  proposalAuditRefs,
  type ProposalType,
} from "@apzhub/qep-ai";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import {
  companionFacts,
  composeDeterministicQualityAnalysis,
  composePermissionSafeAiContext,
} from "@/lib/qep/ai-context-composer";
import {
  createPhase7DestinationWriter,
  createPhase7TargetReader,
} from "@/lib/qep/ai-destination-writer";
import { invokeQepAiModel } from "@/lib/qep/ai-model";
import { getQepAiService } from "@/lib/qep/ai-runtime";
import { getApplicationService } from "@/lib/qep/application-runtime";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import {
  requireQepPermission,
  sessionHasQepPermission,
  sessionTenantId,
} from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

function actorId(context: PlatformApiRequestContext): string {
  return context.serviceContext.userId;
}

function grantedOf(context: PlatformApiRequestContext): readonly string[] {
  return context.serviceContext.permissions ?? [];
}

function mapError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "ai.proposal.not_found" || message.includes("not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (
    message.startsWith("ai.isolation.") ||
    message.startsWith("ai.source.") ||
    message.startsWith("ai.accept.") ||
    message === "ai.proposal.stale"
  ) {
    throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
  }
  if (message.startsWith("ai.model.unavailable")) {
    throw new PlatformApiHttpError(503, { code: "DEPENDENCY_UNAVAILABLE", message });
  }
  throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
}

async function requireApplication(tenantId: string, applicationId: string | undefined) {
  const id = applicationId?.trim() ?? "";
  if (!id) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
  try {
    return await getApplicationService().get(tenantId, id);
  } catch {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "application.not_found",
    });
  }
}

async function readJson(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "invalid_json",
    });
  }
}

function audit(action: string, context: PlatformApiRequestContext, detail: string) {
  appendQepAuditEvent({
    action,
    actor: actorId(context),
    correlationId: context.tracing.correlationId,
    detail,
  });
}

export async function handleAiCompanion(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.read");
  const tenantId = sessionTenantId(context);
  const application = await requireApplication(
    tenantId,
    request.nextUrl.searchParams.get("applicationId") ?? undefined,
  );
  try {
    const snapshot = await companionFacts({
      tenantId,
      applicationId: application.id,
      granted: grantedOf(context),
    });
    audit("ai.companion.viewed", context, `application:${application.id}`);
    return jsonDataResponse(
      {
        applicationId: application.id,
        sourceAccess: snapshot.context.sourceAccess,
        sourceAuthorised: snapshot.context.sourceAuthorised,
        denied: snapshot.context.denied,
        posture: snapshot.readiness.posture,
        facts: snapshot.readiness.facts,
        risks: snapshot.readiness.risks.map((row) => ({
          id: row.id,
          title: row.title,
          severity: row.severity,
          status: row.status,
        })),
        gates: snapshot.readiness.evaluations.map((row) => ({
          id: row.id,
          result: row.result,
        })),
        analysis: snapshot.analysis,
        contextCounts: {
          records: snapshot.context.records.length,
          evidence: snapshot.context.evidence.length,
        },
      },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiAnalysis(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.read");
  const tenantId = sessionTenantId(context);
  const application = await requireApplication(
    tenantId,
    request.nextUrl.searchParams.get("applicationId") ?? undefined,
  );
  try {
    const analysis = await composeDeterministicQualityAnalysis({
      tenantId,
      applicationId: application.id,
    });
    return jsonDataResponse({ analysis, source: "qep_facts" }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiAsk(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const application = await requireApplication(
    tenantId,
    String(body.applicationId ?? ""),
  );
  const instruction = String(body.question ?? body.instruction ?? "").trim();
  if (!instruction) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "question.required",
    });
  }
  try {
    const composed = await composePermissionSafeAiContext({
      tenantId,
      applicationId: application.id,
      granted: grantedOf(context),
      includeSource: Boolean(body.includeSource),
      evidenceExtract: Boolean(body.evidenceExtract),
    });
    const model = await invokeQepAiModel({
      granted: grantedOf(context),
      context: composed,
      instruction,
      mode: "ask",
    });
    audit(
      "ai.model.invoked",
      context,
      `ask application:${application.id} sourceAuthorised:${composed.sourceAuthorised}`,
    );
    return jsonDataResponse(
      {
        ephemeral: true,
        answer: model.text ?? String(model.content.answer ?? ""),
        sourceAccess: composed.sourceAccess,
        sourceAuthorised: composed.sourceAuthorised,
        provider: model.provider,
      },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiGenerate(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const application = await requireApplication(
    tenantId,
    String(body.applicationId ?? ""),
  );
  const proposalType = String(body.proposalType ?? "test_case") as ProposalType;
  try {
    const composed = await composePermissionSafeAiContext({
      tenantId,
      applicationId: application.id,
      granted: grantedOf(context),
      includeSource: Boolean(body.includeSource),
      evidenceExtract: Boolean(body.evidenceExtract),
    });
    const model = await invokeQepAiModel({
      granted: grantedOf(context),
      context: composed,
      proposalType,
      instruction: String(body.instruction ?? "Generate a structured proposal"),
      mode: "generate",
    });
    audit(
      "ai.model.invoked",
      context,
      `generate application:${application.id} type:${proposalType} sourceAuthorised:${composed.sourceAuthorised}`,
    );
    return jsonDataResponse(
      {
        draft: true,
        proposalType,
        content: model.content,
        provider: model.provider,
        model: model.model,
        sourceAccess: composed.sourceAccess,
        sourceAuthorised: composed.sourceAuthorised,
        contextRefs: composed.records.map((row) => `${row.kind}:${row.id}`),
      },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiCreateProposal(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const application = await requireApplication(
    tenantId,
    String(body.applicationId ?? ""),
  );
  try {
    const composed = await composePermissionSafeAiContext({
      tenantId,
      applicationId: application.id,
      granted: grantedOf(context),
      includeSource: Boolean(body.includeSource),
    });
    const created = await getQepAiService().createProposal({
      tenantId,
      applicationId: application.id,
      actorId: actorId(context),
      granted: grantedOf(context),
      proposalType: String(body.proposalType ?? "test_case"),
      content: (body.content as Record<string, unknown>) ?? {},
      context: composed,
      provider: String(body.provider ?? "untrusted"),
      model: String(body.model ?? "untrusted"),
      targetId: typeof body.targetId === "string" ? body.targetId : undefined,
    });
    audit(
      "ai.proposal.generated",
      context,
      `proposal:${created.id} type:${created.proposalType}`,
    );
    return jsonDataResponse({ proposal: created }, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiListProposals(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.read");
  const tenantId = sessionTenantId(context);
  const application = await requireApplication(
    tenantId,
    request.nextUrl.searchParams.get("applicationId") ?? undefined,
  );
  try {
    const items = await getQepAiService().listProposals(tenantId, application.id);
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiGetProposal(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.ai_workspace.read");
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  try {
    const proposal = await getQepAiService().getProposal(
      tenantId,
      params.proposalId ?? "",
    );
    return jsonDataResponse({ proposal }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiModifyProposal(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  const body = await readJson(request);
  try {
    const proposal = await getQepAiService().modifyProposal({
      tenantId,
      proposalId: params.proposalId ?? "",
      actorId: actorId(context),
      content: (body.content as Record<string, unknown>) ?? {},
      note: typeof body.note === "string" ? body.note : undefined,
    });
    audit("ai.proposal.modified", context, `proposal:${proposal.id}`);
    return jsonDataResponse({ proposal }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiRejectProposal(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  const body = await readJson(request).catch((): Record<string, unknown> => ({}));
  try {
    const proposal = await getQepAiService().rejectProposal({
      tenantId,
      proposalId: params.proposalId ?? "",
      actorId: actorId(context),
      note: typeof body.note === "string" ? body.note : undefined,
    });
    audit("ai.proposal.rejected", context, `proposal:${proposal.id}`);
    return jsonDataResponse({ proposal }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiAcceptProposal(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  try {
    const current = await getQepAiService().getProposal(
      tenantId,
      params.proposalId ?? "",
    );
    const required = DESTINATION_PERMISSION[current.proposalType];
    if (required && !sessionHasQepPermission(context, required)) {
      throw new Error("ai.accept.destination_forbidden");
    }
    const proposal = await getQepAiService().acceptProposal({
      tenantId,
      proposalId: current.id,
      actorId: actorId(context),
      granted: grantedOf(context),
      writer: createPhase7DestinationWriter(),
      targetReader: createPhase7TargetReader(),
    });
    audit(
      "ai.proposal.accepted",
      context,
      `proposal:${proposal.id} resulting:${proposal.resultingRecordKind}:${proposal.resultingRecordId ?? ""}`,
    );
    return jsonDataResponse(
      { proposal, audit: proposalAuditRefs(proposal) },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleAiSourceProbe(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const application = await requireApplication(
    tenantId,
    String(body.applicationId ?? ""),
  );
  const composed = await composePermissionSafeAiContext({
    tenantId,
    applicationId: application.id,
    granted: grantedOf(context),
    includeSource: true,
  });
  audit(
    "ai.context.boundary",
    context,
    `sourceAuthorised:${composed.sourceAuthorised} hasSourceRead:${hasSourceRead(grantedOf(context))}`,
  );
  return jsonDataResponse(
    {
      sourceAuthorised: composed.sourceAuthorised,
      sourceAccess: composed.sourceAccess,
      sourcePresent: Boolean(composed.source),
      denied: composed.denied,
    },
    context.tracing,
  );
}
