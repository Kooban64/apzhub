import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GovernanceCatalogueView } from "./governance-catalogue-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("GovernanceCatalogueView (N-03)", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("lists enterprise governance capabilities — not practice modules", () => {
    render(<GovernanceCatalogueView permissions={["law.view"]} />);
    expect(screen.getByTestId("governance-catalogue")).toBeInTheDocument();
    expect(
      screen.getByTestId("governance-catalogue-item-policies"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("governance-catalogue-item-obligations"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("governance-catalogue-item-approvals"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("governance-catalogue-item-evidence"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Matters/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Billing/i)).not.toBeInTheDocument();
  });
});
