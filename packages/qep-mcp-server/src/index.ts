/**
 * Minimal MCP-over-stdio JSON-RPC server (SPR-FULL-002-D).
 * Implements initialize / tools/list / tools/call. Never certifies.
 */

export type McpTool = {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
};

export const QEP_MCP_TOOLS: readonly McpTool[] = [
  {
    name: "requirements.lookup",
    description: "Read-scoped requirement context (advisory).",
    inputSchema: {
      type: "object",
      properties: { subjectRef: { type: "string" } },
    },
  },
  {
    name: "verification.lookup",
    description: "Read-scoped verification context (advisory).",
    inputSchema: {
      type: "object",
      properties: { subjectRef: { type: "string" } },
    },
  },
  {
    name: "assist.propose_write",
    description:
      "Gated write proposal only. Humans must accept in APZHUB; never certifies.",
    inputSchema: {
      type: "object",
      properties: {
        subjectRef: { type: "string" },
        payload: { type: "string" },
      },
      required: ["subjectRef", "payload"],
    },
  },
] as const;

export type JsonRpcId = string | number | null;

export type JsonRpcRequest = {
  readonly jsonrpc?: string;
  readonly id?: JsonRpcId;
  readonly method?: string;
  readonly params?: Record<string, unknown>;
};

export function assertMcpNeverCertifies(operation: string): void {
  const n = operation.toLowerCase();
  if (n.includes("certif") || n.endsWith(".go") || n.includes("no_go")) {
    throw new Error("mcp.certification_forbidden");
  }
}

export function handleMcpJsonRpc(message: JsonRpcRequest): Record<string, unknown> {
  const id = message.id ?? null;
  const method = message.method ?? "";
  assertMcpNeverCertifies(method);

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "apzhub-qep-mcp", version: "0.1.0" },
        instructions:
          "APZQEP MCP tools are advisory. Gated writes create proposals only. Never certifies.",
      },
    };
  }

  if (method === "notifications/initialized" || method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: QEP_MCP_TOOLS.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      },
    };
  }

  if (method === "tools/call") {
    const params = message.params ?? {};
    const name = String(params.name ?? "");
    assertMcpNeverCertifies(name);
    const args = (params.arguments ?? {}) as Record<string, unknown>;
    if (!QEP_MCP_TOOLS.some((t) => t.name === name)) {
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32602, message: `Unknown tool: ${name}` },
      };
    }
    if (name === "assist.propose_write") {
      const subjectRef = String(args.subjectRef ?? "").trim();
      const payload = String(args.payload ?? "").trim();
      if (!subjectRef || !payload) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "subjectRef and payload required" },
        };
      }
      const proposalId = `mcp_stdio_${Date.now().toString(36)}`;
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `Gated write proposal ${proposalId} recorded locally for subject ${subjectRef}. Submit via APZHUB UI/API for human accept. Never certifies.`,
            },
          ],
          structuredContent: {
            proposalId,
            subjectRef,
            status: "pending_local",
            transport: "stdio",
          },
          isError: false,
        },
      };
    }
    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: `Read tool ${name} acknowledged for ${String(args.subjectRef ?? "n/a")}. No SoR mutation.`,
          },
        ],
        isError: false,
      },
    };
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}
