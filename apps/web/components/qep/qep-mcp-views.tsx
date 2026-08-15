"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { McpToolDefinition, McpWriteProposal } from "@/lib/qep/mcp-proposal-store";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

export function QepMcpRouterView() {
  const queryClient = useQueryClient();
  const [subjectRef, setSubjectRef] = useState("");
  const [payload, setPayload] = useState("");

  const catalogueQuery = useQuery({
    queryKey: ["qep-mcp", "catalogue"],
    queryFn: () =>
      fetchJson<{
        tools: McpToolDefinition[];
        proposals: McpWriteProposal[];
        disclaimer: string;
        liveGatewayEnabled: boolean;
      }>("/api/v1/qep/mcp"),
  });

  const proposeMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ proposal: McpWriteProposal }>("/api/v1/qep/mcp", {
        method: "POST",
        body: JSON.stringify({
          action: "propose_write",
          toolId: "assist.propose_write",
          subjectRef,
          payload,
        }),
      }),
    onSuccess: () => {
      setPayload("");
      void queryClient.invalidateQueries({ queryKey: ["qep-mcp"] });
    },
  });

  const decideMutation = useMutation({
    mutationFn: (input: { proposalId: string; action: "accept" | "reject" }) =>
      fetchJson("/api/v1/qep/mcp", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-mcp"] });
    },
  });

  const tools = catalogueQuery.data?.tools ?? [];
  const proposals = catalogueQuery.data?.proposals ?? [];

  return (
    <QepPageShell
      title="MCP and Developer Experience"
      description="Governed agent/IDE tools. Gated writes create audited proposals only — humans accept; this surface cannot certify."
    >
      <QepPanel title="Policy">
        <p
          className="text-sm text-[var(--color-muted-foreground)]"
          data-testid="qep-mcp-disclaimer"
        >
          {catalogueQuery.data?.disclaimer ??
            "MCP tools are advisory. Certification remains human-only."}
        </p>
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          Transport: HTTP catalogue +{" "}
          <code className="text-xs">POST /api/v1/qep/mcp/rpc</code> (JSON-RPC tools/list
          · tools/call). Full external MCP SDK server remains optional.
        </p>
      </QepPanel>

      <QepPanel title="Tool catalogue">
        {catalogueQuery.isLoading ? (
          <QepLoadingState label="Loading MCP tools…" />
        ) : catalogueQuery.isError ? (
          <QepErrorState message={(catalogueQuery.error as Error).message} />
        ) : tools.length === 0 ? (
          <QepEmptyState title="No MCP tools registered." />
        ) : (
          <ul className="space-y-2" data-testid="qep-mcp-tools">
            {tools.map((tool) => (
              <li
                key={tool.toolId}
                className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{tool.title}</span>
                  <QepStatusBadge status={tool.capability} />
                  <span className="font-mono text-xs">{tool.toolId}</span>
                </div>
                <p className="mt-1 text-[var(--color-muted-foreground)]">
                  {tool.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </QepPanel>

      <QepPanel title="Propose gated write">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Subject reference
            <input
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-2"
              value={subjectRef}
              onChange={(event) => setSubjectRef(event.target.value)}
              placeholder="req-…, ver-…"
              data-testid="qep-mcp-subject"
            />
          </label>
          <label className="text-sm md:col-span-2">
            Proposal payload
            <textarea
              className="mt-1 min-h-24 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-2"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              placeholder="Draft content for human review. Do not include secrets."
              data-testid="qep-mcp-payload"
            />
          </label>
        </div>
        <div className="mt-3">
          <Button
            type="button"
            onClick={() => proposeMutation.mutate()}
            disabled={
              !subjectRef.trim() || !payload.trim() || proposeMutation.isPending
            }
          >
            {proposeMutation.isPending ? "Submitting…" : "Submit proposal"}
          </Button>
        </div>
        {proposeMutation.isError ? (
          <div className="mt-3">
            <QepErrorState message={(proposeMutation.error as Error).message} />
          </div>
        ) : null}
      </QepPanel>

      <QepPanel title="Pending proposals">
        {proposals.length === 0 ? (
          <QepEmptyState title="No MCP proposals yet." />
        ) : (
          <ul className="space-y-3" data-testid="qep-mcp-proposals">
            {proposals.map((proposal) => (
              <li
                key={proposal.proposalId}
                className="rounded border border-[var(--color-border)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-mono text-xs">{proposal.proposalId}</span>
                  <QepStatusBadge status={proposal.status} />
                  <span className="font-mono text-xs">{proposal.subjectRef}</span>
                </div>
                <p className="mt-2 text-sm">{proposal.payload}</p>
                {proposal.status === "pending" ? (
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        decideMutation.mutate({
                          proposalId: proposal.proposalId,
                          action: "accept",
                        })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        decideMutation.mutate({
                          proposalId: proposal.proposalId,
                          action: "reject",
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </QepPanel>
    </QepPageShell>
  );
}
