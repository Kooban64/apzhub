import { describe, expect, it } from "vitest";

import { assertMcpNeverCertifies, handleMcpJsonRpc } from "./index.js";

describe("qep-mcp-server (SPR-FULL-002-D)", () => {
  it("lists tools without certify", () => {
    const res = handleMcpJsonRpc({ jsonrpc: "2.0", id: 1, method: "tools/list" });
    const tools = (res.result as { tools: Array<{ name: string }> }).tools;
    expect(tools.some((t) => t.name === "assist.propose_write")).toBe(true);
    expect(tools.every((t) => !t.name.includes("certify"))).toBe(true);
  });

  it("handles gated write call", () => {
    const res = handleMcpJsonRpc({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "assist.propose_write",
        arguments: { subjectRef: "req-1", payload: "draft step" },
      },
    });
    expect(res.error).toBeUndefined();
    expect(JSON.stringify(res.result)).toMatch(/Never certifies/);
  });

  it("rejects certification operations", () => {
    expect(() => assertMcpNeverCertifies("certification.decide")).toThrow(
      /certification_forbidden/,
    );
  });
});
