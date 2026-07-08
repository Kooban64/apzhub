import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LawUxFoundationGallery } from "./ux-foundation-gallery";

describe("LawUxFoundationGallery", () => {
  it("renders the UX foundation catalogue", () => {
    render(<LawUxFoundationGallery />);

    expect(screen.getByTestId("law-ux-foundation-gallery")).toBeInTheDocument();
    expect(screen.getByText("Law Platform component catalogue")).toBeInTheDocument();
    expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
    expect(screen.getByTestId("law-detail-page-layout")).toBeInTheDocument();
    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();
    expect(screen.getByTestId("law-empty-state-no-clients")).toBeInTheDocument();
  });
});
