import { beforeEach, describe, expect, it } from "vitest";

import {
  assertMcpNeverCertifies,
  createMcpWriteProposal,
  decideMcpProposal,
  listMcpProposals,
  listMcpTools,
  resetMcpProposalStoreForTests,
} from "./mcp-proposal-store";

describe("mcp-proposal-store (SPR-APZQEP-230-D)", () => {
  beforeEach(() => {
    resetMcpProposalStoreForTests();
  });

  it("exposes read and gated-write tools without certify", () => {
    const tools = listMcpTools();
    expect(tools.some((t) => t.toolId === "requirements.lookup")).toBe(true);
    expect(tools.some((t) => t.capability === "gated_write")).toBe(true);
    expect(tools.every((t) => !t.toolId.includes("certify"))).toBe(true);
  });

  it("creates and accepts a gated write proposal", () => {
    const proposal = createMcpWriteProposal({
      toolId: "assist.propose_write",
      subjectRef: "req-1",
      payload: "Draft verification step for login",
      actorId: "agent-1",
    });
    expect(proposal.proposalId).toMatch(/^mcp_/);
    expect(proposal.status).toBe("pending");
    expect(listMcpProposals()).toHaveLength(1);

    const accepted = decideMcpProposal({
      proposalId: proposal.proposalId,
      action: "accept",
      actorId: "human-1",
      humanNote: "Looks good",
    });
    expect(accepted?.status).toBe("accepted");
    expect(accepted?.humanNote).toBe("Looks good");
  });

  it("rejects certification operations", () => {
    expect(() => assertMcpNeverCertifies("qep.certification.decide")).toThrow(
      /certification_forbidden/,
    );
  });
});
