/**
 * MCP DX tools + gated-write proposals (SPR-APZQEP-230-D).
 * Default-deny via permissions; never certifies.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import {
  assertMcpNeverCertifies,
  createMcpWriteProposal,
  decideMcpProposal,
  getMcpProposal,
  isMcpToolId,
  listMcpProposals,
  listMcpTools,
} from "@/lib/qep/mcp-proposal-store";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import { requireQepPermission } from "./require-qep-permission";

export async function handleListMcpCatalogue(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.mcp-dx.read");
  assertMcpNeverCertifies("mcp.catalogue.read");
  return jsonDataResponse(
    {
      tools: listMcpTools(),
      proposals: listMcpProposals(),
      liveGatewayEnabled: false,
      disclaimer:
        "MCP tools are advisory. Gated writes create proposals only. Humans accept; certification remains human-only.",
    },
    context.tracing,
  );
}

export async function handleMcpMutation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.mcp-dx.operate");
  const body = (await request.json()) as {
    action?: string;
    toolId?: string;
    subjectRef?: string;
    payload?: string;
    proposalId?: string;
    humanNote?: string;
  };

  const actorId = context.serviceContext.userId ?? "unknown";
  const { correlationId } = context.tracing;
  const action = body.action?.trim();

  if (action === "propose_write") {
    assertMcpNeverCertifies("mcp.propose_write");
    if (
      !isMcpToolId(body.toolId) ||
      !body.subjectRef?.trim() ||
      !body.payload?.trim()
    ) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "toolId, subjectRef, and payload are required for propose_write",
      });
    }
    try {
      const proposal = createMcpWriteProposal({
        toolId: body.toolId,
        subjectRef: body.subjectRef,
        payload: body.payload,
        actorId,
      });
      appendQepAuditEvent({
        action: "mcp.proposal.created",
        actor: actorId,
        correlationId,
        detail: proposal.proposalId,
      });
      return jsonDataResponse({ proposal }, context.tracing);
    } catch {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "toolId must be a gated-write tool (assist.propose_write)",
      });
    }
  }

  if (action === "accept" || action === "reject") {
    assertMcpNeverCertifies(`mcp.proposal.${action}`);
    const proposalId = body.proposalId?.trim();
    if (!proposalId) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "proposalId is required",
      });
    }
    if (!getMcpProposal(proposalId)) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "MCP proposal not found",
      });
    }
    const proposal = decideMcpProposal({
      proposalId,
      action,
      actorId,
      ...(body.humanNote !== undefined ? { humanNote: body.humanNote } : {}),
    });
    appendQepAuditEvent({
      action: `mcp.proposal.${action}`,
      actor: actorId,
      correlationId,
      detail: proposalId,
    });
    return jsonDataResponse({ proposal }, context.tracing);
  }

  throw new PlatformApiHttpError(400, {
    code: "VALIDATION_ERROR",
    message: "action must be propose_write|accept|reject",
  });
}
