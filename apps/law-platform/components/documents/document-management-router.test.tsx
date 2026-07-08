import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DocumentManagementRouter } from "./document-management-router";
import { SEED_DOCUMENTS, resetSharedDocumentRepository } from "../../lib/documents";
import { renderWithDocumentWorkflow } from "../../lib/documents/test-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("DocumentManagementRouter", () => {
  beforeEach(() => {
    resetSharedDocumentRepository();
  });

  it("routes to list, detail, create, and edit pages", async () => {
    const { rerender } = renderWithDocumentWorkflow(
      <DocumentManagementRouter pathname="/workspace/law/documents" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
    });

    rerender(<DocumentManagementRouter pathname="/workspace/law/documents/new" />);
    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();

    const document = SEED_DOCUMENTS[0]!;
    rerender(
      <DocumentManagementRouter
        pathname={`/workspace/law/documents/${document.documentId}`}
      />,
    );
    expect(screen.getByRole("heading", { name: document.title })).toBeInTheDocument();

    rerender(
      <DocumentManagementRouter
        pathname={`/workspace/law/documents/${document.documentId}/edit`}
      />,
    );
    expect(screen.getByDisplayValue(document.title)).toBeInTheDocument();
  });
});
