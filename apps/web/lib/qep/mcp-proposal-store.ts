/**
 * MCP gated-write proposal ledger (SPR-APZQEP-230-D).
 * Tools are advisory / proposal-only — never certify.
 */

import { randomUUID } from "node:crypto";

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type McpToolId =
  "requirements.lookup" | "verification.lookup" | "assist.propose_write";

export type McpToolCapability = "read" | "gated_write";

export type McpToolDefinition = {
  readonly toolId: McpToolId;
  readonly title: string;
  readonly description: string;
  readonly capability: McpToolCapability;
};

export type McpProposalStatus = "pending" | "accepted" | "rejected";

export type McpWriteProposal = {
  readonly proposalId: string;
  readonly toolId: McpToolId;
  readonly subjectRef: string;
  readonly payload: string;
  readonly status: McpProposalStatus;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly humanNote?: string;
};

type Snapshot = { readonly items: readonly McpWriteProposal[] };

const FILE = "proposals.json";
const proposals: McpWriteProposal[] = [];
let hydrated = false;

export const MCP_TOOL_CATALOGUE: readonly McpToolDefinition[] = [
  {
    toolId: "requirements.lookup",
    title: "Requirements lookup",
    description: "Read-scoped requirement context for IDE/agent assistants.",
    capability: "read",
  },
  {
    toolId: "verification.lookup",
    title: "Verification lookup",
    description: "Read-scoped verification / evidence context.",
    capability: "read",
  },
  {
    toolId: "assist.propose_write",
    title: "Propose SoR write",
    description:
      "Gated write: creates an audited proposal. A human must accept before any owning-module action. Never certifies.",
    capability: "gated_write",
  },
] as const;

const WRITE_TOOLS = new Set<McpToolId>(["assist.propose_write"]);

export function isMcpToolId(value: unknown): value is McpToolId {
  return (
    typeof value === "string" &&
    MCP_TOOL_CATALOGUE.some((tool) => tool.toolId === value)
  );
}

export function isMcpGatedWriteTool(toolId: McpToolId): boolean {
  return WRITE_TOOLS.has(toolId);
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<Snapshot>(resolveQepDataRoot("qep-mcp"), FILE);
  if (snap?.items?.length) proposals.push(...snap.items);
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(resolveQepDataRoot("qep-mcp"), FILE, {
    items: proposals.slice(0, 500),
  });
}

export function resetMcpProposalStoreForTests(): void {
  proposals.splice(0, proposals.length);
  hydrated = false;
}

export function listMcpTools(): readonly McpToolDefinition[] {
  return MCP_TOOL_CATALOGUE;
}

export function listMcpProposals(): readonly McpWriteProposal[] {
  hydrate();
  return [...proposals];
}

export function getMcpProposal(proposalId: string): McpWriteProposal | null {
  hydrate();
  return proposals.find((row) => row.proposalId === proposalId) ?? null;
}

export function createMcpWriteProposal(input: {
  readonly toolId: McpToolId;
  readonly subjectRef: string;
  readonly payload: string;
  readonly actorId: string;
}): McpWriteProposal {
  if (!isMcpGatedWriteTool(input.toolId)) {
    throw new Error("mcp.tool_not_gated_write");
  }
  hydrate();
  const now = new Date().toISOString();
  const next: McpWriteProposal = {
    proposalId: `mcp_${randomUUID().slice(0, 8)}`,
    toolId: input.toolId,
    subjectRef: input.subjectRef.trim(),
    payload: input.payload.trim(),
    status: "pending",
    createdAt: now,
    createdBy: input.actorId,
    updatedAt: now,
    updatedBy: input.actorId,
  };
  proposals.unshift(next);
  persist();
  return next;
}

export function decideMcpProposal(input: {
  readonly proposalId: string;
  readonly action: "accept" | "reject";
  readonly actorId: string;
  readonly humanNote?: string;
}): McpWriteProposal | null {
  hydrate();
  const idx = proposals.findIndex((row) => row.proposalId === input.proposalId);
  if (idx < 0) return null;
  const prev = proposals[idx]!;
  if (prev.status !== "pending") return prev;
  const note = input.humanNote?.trim();
  const next: McpWriteProposal = {
    ...prev,
    status: input.action === "accept" ? "accepted" : "rejected",
    updatedAt: new Date().toISOString(),
    updatedBy: input.actorId,
    ...(note ? { humanNote: note } : {}),
  };
  proposals[idx] = next;
  persist();
  return next;
}

/** Defence-in-depth: MCP must never route certification decisions. */
export function assertMcpNeverCertifies(operation: string): void {
  const normalized = operation.trim().toLowerCase().replaceAll("-", "_");
  if (
    normalized.includes("certification.decide") ||
    normalized.endsWith(".go") ||
    normalized.endsWith(".no_go") ||
    normalized.includes("certify")
  ) {
    throw new Error("mcp.certification_forbidden");
  }
}
