/**
 * Minimal JSON-RPC 2.0 MCP-style transport (SPR-APZQEP-230-D residual).
 * Not a full MCP SDK server — HTTP tools/list + tools/call only; never certifies.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import {
  assertMcpNeverCertifies,
  createMcpWriteProposal,
  isMcpToolId,
  listMcpTools,
} from "@/lib/qep/mcp-proposal-store";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import { requireQepPermission } from "./require-qep-permission";

type JsonRpcRequest = {
  readonly jsonrpc?: string;
  readonly id?: string | number | null;
  readonly method?: string;
  readonly params?: {
    readonly name?: string;
    readonly arguments?: {
      readonly subjectRef?: string;
      readonly payload?: string;
      readonly toolId?: string;
    };
  };
};

function rpcResult(
  id: string | number | null | undefined,
  result: unknown,
): Record<string, unknown> {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function rpcError(
  id: string | number | null | undefined,
  code: number,
  message: string,
): Record<string, unknown> {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

export async function handleMcpJsonRpc(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.mcp-dx.operate", "qep.mcp-dx.read");
  assertMcpNeverCertifies("mcp.jsonrpc");

  const body = (await request.json().catch(() => ({}))) as JsonRpcRequest;
  if (body.jsonrpc !== "2.0" || !body.method) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "JSON-RPC 2.0 request with method is required",
    });
  }

  const actorId = context.serviceContext.userId ?? "unknown";
  const { correlationId } = context.tracing;

  if (body.method === "tools/list" || body.method === "mcp.tools.list") {
    requireQepPermission(context, "qep.mcp-dx.read");
    return jsonDataResponse(
      rpcResult(body.id, {
        tools: listMcpTools().map((tool) => ({
          name: tool.toolId,
          description: tool.description,
          inputSchema: {
            type: "object",
            properties: {
              subjectRef: { type: "string" },
              payload: { type: "string" },
            },
          },
          annotations: { capability: tool.capability, neverCertifies: true },
        })),
      }),
      context.tracing,
    );
  }

  if (body.method === "tools/call" || body.method === "mcp.tools.call") {
    requireQepPermission(context, "qep.mcp-dx.operate");
    assertMcpNeverCertifies("mcp.tools.call");
    const name = body.params?.name?.trim() ?? body.params?.arguments?.toolId?.trim();
    const subjectRef = body.params?.arguments?.subjectRef?.trim() ?? "";
    const payload = body.params?.arguments?.payload?.trim() ?? "";
    if (!name || !isMcpToolId(name)) {
      return jsonDataResponse(
        rpcError(body.id, -32602, "Unknown or missing tool name"),
        context.tracing,
      );
    }
    if (name !== "assist.propose_write") {
      return jsonDataResponse(
        rpcResult(body.id, {
          content: [
            {
              type: "text",
              text: `Read tool ${name} acknowledged. No SoR mutation. Use assist.propose_write for gated writes.`,
            },
          ],
          isError: false,
        }),
        context.tracing,
      );
    }
    if (!subjectRef || !payload) {
      return jsonDataResponse(
        rpcError(body.id, -32602, "subjectRef and payload are required"),
        context.tracing,
      );
    }
    const proposal = createMcpWriteProposal({
      toolId: name,
      subjectRef,
      payload,
      actorId,
    });
    appendQepAuditEvent({
      action: "mcp.rpc.propose_write",
      actor: actorId,
      correlationId,
      detail: proposal.proposalId,
    });
    return jsonDataResponse(
      rpcResult(body.id, {
        content: [
          {
            type: "text",
            text: `Gated write proposal ${proposal.proposalId} created (pending human accept). Never certifies.`,
          },
        ],
        structuredContent: { proposal },
        isError: false,
      }),
      context.tracing,
    );
  }

  return jsonDataResponse(
    rpcError(body.id, -32601, `Method not found: ${body.method}`),
    context.tracing,
  );
}
