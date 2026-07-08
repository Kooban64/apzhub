import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KnowledgeDiscoveryDiagnostics } from "./knowledge-discovery-diagnostics";

vi.mock("@apzhub/knowledge-discovery-framework/react", () => ({
  useKnowledgeRegistry: () => ({
    isReady: true,
    diagnostics: {
      status: "hydrated",
      sourceCount: 4,
      activeSourceCount: 3,
    },
  }),
  useKnowledgeService: () => ({
    serviceDiagnostics: {
      frameworkStatus: "service",
      serviceStatus: "ready",
      queryAvailable: true,
      queryClient: { kind: "orchestrator", ready: true },
    },
  }),
}));

describe("KnowledgeDiscoveryDiagnostics", () => {
  it("exposes Knowledge Service diagnostics for developer verification", () => {
    render(<KnowledgeDiscoveryDiagnostics />);

    const node = screen.getByTestId("knowledge-discovery-diagnostics");
    expect(node).toHaveAttribute("data-framework-status", "service");
    expect(node).toHaveAttribute("data-service-status", "ready");
    expect(node).toHaveAttribute("data-registry-ready", "true");
    expect(node).toHaveAttribute("data-query-available", "true");
    expect(node).toHaveAttribute("data-query-client-kind", "orchestrator");
    expect(node).toHaveAttribute("data-source-count", "4");
    expect(node).toHaveAttribute("data-active-source-count", "3");
  });
});
