import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KnowledgeHomeView } from "./knowledge-home-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/knowledge/organisational-memory-api", () => ({
  listKnowledgeObjects: vi.fn(async () => []),
}));

function renderHome(permissions: string[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <KnowledgeHomeView permissions={permissions} />
    </QueryClientProvider>,
  );
}

describe("KnowledgeHomeView", () => {
  it("expresses Memory Companion organisational memory experience", () => {
    renderHome(["knowledge.view"]);

    expect(screen.getByTestId("knowledge-home-onboarding")).toBeInTheDocument();
    expect(
      screen.getByText("What do I need to know to do this well?"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-prompts")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-types")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-live-memory")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-featured")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-link-companion")).toBeInTheDocument();
    expect(
      screen.getByText(/not a document library or search portal/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("knowledge-home-operator")).not.toBeInTheDocument();
  });

  it("keeps diagnostics secondary for operators", () => {
    renderHome(["knowledge.view", "knowledge.admin"]);
    expect(screen.getByTestId("knowledge-home-operator")).toBeInTheDocument();
  });

  it("denies access without knowledge.view", () => {
    renderHome([]);
    expect(screen.getByText("Permission required")).toBeInTheDocument();
  });
});
