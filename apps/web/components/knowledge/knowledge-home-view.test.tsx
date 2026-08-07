import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KnowledgeHomeView } from "./knowledge-home-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("KnowledgeHomeView", () => {
  it("expresses Memory Companion organisational memory experience", () => {
    render(<KnowledgeHomeView permissions={["knowledge.view"]} />);

    expect(screen.getByTestId("knowledge-home-onboarding")).toBeInTheDocument();
    expect(
      screen.getByText("What do I need to know to do this well?"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-prompts")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-types")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-featured")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-home-link-companion")).toBeInTheDocument();
    expect(
      screen.getByText(/not a document library or search portal/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("knowledge-home-operator")).not.toBeInTheDocument();
  });

  it("keeps diagnostics secondary for operators", () => {
    render(<KnowledgeHomeView permissions={["knowledge.view", "knowledge.admin"]} />);
    expect(screen.getByTestId("knowledge-home-operator")).toBeInTheDocument();
  });

  it("denies access without knowledge.view", () => {
    render(<KnowledgeHomeView permissions={[]} />);
    expect(screen.getByText("Permission required")).toBeInTheDocument();
  });
});
