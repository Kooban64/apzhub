import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KnowledgeCompanionView } from "./knowledge-companion-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("KnowledgeCompanionView", () => {
  it("models companion consumers without claiming wiring", () => {
    render(<KnowledgeCompanionView permissions={["knowledge.view"]} />);

    expect(screen.getByTestId("knowledge-companion-consumers")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-companion-projects")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-companion-law")).toBeInTheDocument();
    expect(screen.getByTestId("knowledge-companion-apzqep")).toBeInTheDocument();
    expect(screen.getByText(/future integration work/i)).toBeInTheDocument();
  });
});
