import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KnowledgeCompanionView } from "./knowledge-companion-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/knowledge/organisational-memory-api", () => ({
  listKnowledgeObjects: vi.fn(async () => []),
}));

describe("KnowledgeCompanionView", () => {
  it("models companion consumers without claiming wiring", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <KnowledgeCompanionView permissions={["knowledge.view"]} />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("knowledge-companion-live-memory")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-companion-consumers")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-companion-projects")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-companion-law")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-companion-apzqep")).toBeInTheDocument();
    expect(screen.getByText(/future integration work/i)).toBeInTheDocument();
  });
});
