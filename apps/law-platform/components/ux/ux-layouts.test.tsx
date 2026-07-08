import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  LawDetailPageLayout,
  LawFormPageLayout,
  LawListPageLayout,
  LawPageHeader,
  LawWorkspaceLayout,
} from "./index";

describe("Law UX layouts", () => {
  it("renders workspace layout regions", () => {
    render(
      <LawWorkspaceLayout
        header={<LawPageHeader title="Header" />}
        toolbar={<div>Toolbar</div>}
        contextPanel={<aside data-testid="context">Panel</aside>}
      >
        Content
      </LawWorkspaceLayout>,
    );

    expect(screen.getByTestId("law-workspace-layout")).toBeInTheDocument();
    expect(screen.getByTestId("law-page-header")).toHaveTextContent("Header");
    expect(screen.getByText("Toolbar")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByTestId("context")).toBeInTheDocument();
  });

  it("renders list page layout with default search, filters, and pagination", () => {
    render(
      <LawListPageLayout
        header={<LawPageHeader title="List" subtitle="Subtitle" />}
        table={<div data-testid="table">Table</div>}
      />,
    );

    expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
    expect(screen.getByTestId("law-search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("law-filter-bar")).toBeInTheDocument();
    expect(screen.getByTestId("law-pagination")).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("renders detail page placeholders", () => {
    render(
      <LawDetailPageLayout
        header={<LawPageHeader title="Detail" />}
        properties={<div>Properties</div>}
        timeline={<div>Timeline</div>}
        documents={<div>Documents</div>}
        activity={<div>Activity</div>}
      />,
    );

    expect(screen.getByTestId("law-detail-page-layout")).toBeInTheDocument();
    expect(screen.getByTestId("law-detail-properties")).toBeInTheDocument();
    expect(screen.getByTestId("law-detail-timeline")).toBeInTheDocument();
    expect(screen.getByTestId("law-detail-documents")).toBeInTheDocument();
    expect(screen.getByTestId("law-detail-activity")).toBeInTheDocument();
  });

  it("renders form page layout with validation summary", () => {
    render(
      <LawFormPageLayout
        header={<LawPageHeader title="Form" />}
        validationSummary="Fix the highlighted fields."
        sections={<div>Sections</div>}
      />,
    );

    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();
    expect(screen.getByTestId("law-form-validation-summary")).toHaveTextContent(
      "Fix the highlighted fields.",
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});
