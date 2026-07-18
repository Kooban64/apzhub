"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockDocumentClient,
  MOCK_DOCUMENT,
} from "@/lib/documents/mock-document-client";
import { resetDocumentClient, setDocumentClient } from "@/lib/documents/document-api";

import { PlatformDocumentsView } from "./platform-documents-view";
import { DocumentsWorkspaceRouter } from "./documents-workspace-router";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/documents/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformDocumentsView", () => {
  beforeEach(() => {
    resetDocumentClient();
    setDocumentClient(createMockDocumentClient());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
  });

  it("renders overview with mock documents and toolbar", async () => {
    render(wrap(<PlatformDocumentsView section="overview" />));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
      expect(screen.getByText(MOCK_DOCUMENT.title)).toBeTruthy();
    });

    expect(screen.getByRole("toolbar", { name: /Documents commands/i })).toBeTruthy();
    expect(screen.getByTestId("documents-page")).toBeTruthy();
  });

  it("filters documents and opens metadata / diagnostics commands", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformDocumentsView section="documents" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_DOCUMENT.title)).toBeTruthy();
    });

    const search = screen.getByLabelText(/Filter documents by metadata/i);
    await user.clear(search);
    await user.type(search, "zzz-no-match");
    await waitFor(() => {
      expect(screen.queryByText(MOCK_DOCUMENT.title)).toBeNull();
      expect(screen.getByText(/No documents found/i)).toBeTruthy();
    });

    await user.clear(search);
    await waitFor(() => {
      expect(screen.getByText(MOCK_DOCUMENT.title)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /View Metadata/i }));
    await waitFor(() => {
      expect(screen.getByTestId("documents-detail-panel")).toBeTruthy();
      expect(screen.getByText(MOCK_DOCUMENT.id)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Inspect Diagnostics/i }));
    await waitFor(() => {
      expect(screen.getByText(/providerReady/i)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Copy Document ID/i }));
    await waitFor(() => {
      expect(screen.getByText(/Copied document ID/i)).toBeTruthy();
    });
  });

  it("renders versions, folders, tags, audit, and diagnostics sections", async () => {
    const { rerender } = render(wrap(<PlatformDocumentsView section="versions" />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Versions" })).toBeTruthy();
      expect(screen.getByText(MOCK_DOCUMENT.title)).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText("application/pdf")).toBeTruthy();
    });

    rerender(wrap(<PlatformDocumentsView section="folders" />));
    await waitFor(() => {
      expect(screen.getByText("folder_policies")).toBeTruthy();
    });

    rerender(wrap(<PlatformDocumentsView section="collections" />));
    await waitFor(() => {
      expect(screen.getByText("collection_compliance")).toBeTruthy();
    });

    rerender(wrap(<PlatformDocumentsView section="tags" />));
    await waitFor(() => {
      expect(screen.getByText("policy")).toBeTruthy();
    });

    rerender(wrap(<PlatformDocumentsView section="audit" />));
    await waitFor(() => {
      expect(screen.getByText(/document.created/i)).toBeTruthy();
    });

    rerender(wrap(<PlatformDocumentsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("documents-diagnostics")).toBeTruthy();
      expect(screen.getAllByText("memory").length).toBeGreaterThan(0);
    });
  });

  it("covers remaining read-only sections and command panels", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      wrap(<PlatformDocumentsView section="relationships" />),
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Relationships" }),
      ).toBeTruthy();
    });

    rerender(wrap(<PlatformDocumentsView section="retention" />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Retention" })).toBeTruthy();
      expect(screen.getByText(MOCK_DOCUMENT.title)).toBeTruthy();
    });

    rerender(wrap(<PlatformDocumentsView section="metadata" />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Metadata" })).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /View Versions/i }));
    await waitFor(() => {
      expect(screen.getByTestId("documents-detail-panel")).toBeTruthy();
      expect(screen.getByText("application/pdf")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Close$/i }));

    await user.click(screen.getByRole("button", { name: /View Relationships/i }));
    await waitFor(() => {
      expect(screen.getByText(/Relationship metadata is read-only/i)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Close$/i }));

    await user.click(screen.getByRole("button", { name: /View Retention/i }));
    await waitFor(() => {
      expect(screen.getByText(/Retention ID/i)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Close$/i }));

    await user.click(screen.getByRole("button", { name: /View Audit/i }));
    await waitFor(() => {
      expect(screen.getByText(/document.created/i)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Close$/i }));

    await user.click(screen.getByRole("button", { name: /Open Folder/i }));
    await waitFor(() => {
      expect(screen.getByText(/folder_policies/i)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Close$/i }));

    await user.click(screen.getByRole("button", { name: /Open Collection/i }));
    await waitFor(() => {
      expect(screen.getByText(/collection_compliance/i)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Close$/i }));

    await user.click(screen.getByRole("button", { name: /View Versions/i }));
    await waitFor(() => {
      expect(screen.getByText("application/pdf")).toBeTruthy();
    });
    await user.click(screen.getByTestId("documents-row-ver_mock_1"));
    await user.click(screen.getByRole("button", { name: /Copy Version ID/i }));
    await waitFor(() => {
      expect(screen.getByText(/Copied version ID/i)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Refresh/i }));
    await waitFor(() => {
      expect(screen.getByText(/Refreshed/i)).toBeTruthy();
    });
  });

  it("handles list errors, pagination, and filter controls", async () => {
    const user = userEvent.setup();
    setDocumentClient(
      createMockDocumentClient({
        listDocuments: async () => {
          throw new Error("list failed");
        },
      }),
    );
    const { unmount } = render(wrap(<PlatformDocumentsView section="documents" />));
    await waitFor(() => {
      expect(screen.getByTestId("documents-error")).toBeTruthy();
      expect(screen.getByText(/list failed/i)).toBeTruthy();
    });
    unmount();

    setDocumentClient(createMockDocumentClient());
    render(wrap(<PlatformDocumentsView section="documents" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_DOCUMENT.title)).toBeTruthy();
    });

    await user.selectOptions(screen.getByLabelText(/Sort documents/i), "status");
    await user.selectOptions(screen.getByLabelText(/Sort order/i), "desc");
    await user.type(screen.getByLabelText(/Filter by status/i), "published");
    await user.type(screen.getByLabelText(/Filter by classification/i), "internal");
    await user.type(screen.getByLabelText(/Filter by owner/i), "user_1");
    await waitFor(() => {
      expect(screen.getByText(MOCK_DOCUMENT.title)).toBeTruthy();
    });
  });

  it("handles diagnostics errors and empty audit", async () => {
    setDocumentClient(
      createMockDocumentClient({
        getDiagnostics: async () => {
          throw new Error("diagnostics down");
        },
        listAudit: async () => ({ items: [] }),
      }),
    );
    const { rerender } = render(wrap(<PlatformDocumentsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("documents-error")).toBeTruthy();
      expect(screen.getByText(/diagnostics down/i)).toBeTruthy();
    });

    rerender(wrap(<PlatformDocumentsView section="audit" />));
    await waitFor(() => {
      expect(screen.getByText(/No audit entries/i)).toBeTruthy();
    });
  });

  it("paginates long document lists and opens folder/tag filters", async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 12 }, (_, index) => ({
      documentId: `doc_page_${index}`,
      title: `Paged Doc ${String(index).padStart(2, "0")}`,
      status: "draft",
      classification: "internal",
      documentType: "file",
      updatedAt: `2026-07-13T1${String(index).padStart(2, "0")}:00:00.000Z`,
      tagNames: index === 0 ? ["alpha"] : [],
      folderId: index === 0 ? "folder_x" : undefined,
      collectionId: index === 0 ? "collection_x" : undefined,
      ownerUserId: "user_1",
    }));
    setDocumentClient(
      createMockDocumentClient({
        listDocuments: async () => ({
          items: many,
          page: { limit: 12, hasMore: false },
        }),
        getDocument: async (id) => ({
          id,
          title: `Paged Doc`,
          status: "draft",
          classification: "internal",
          documentType: "file",
          createdAt: "2026-07-13T10:00:00.000Z",
          updatedAt: "2026-07-13T10:00:00.000Z",
          folderId: "folder_x",
          collectionId: "collection_x",
          tagNames: ["alpha"],
        }),
      }),
    );
    render(wrap(<PlatformDocumentsView section="documents" />));
    await waitFor(() => {
      expect(screen.getByText("Paged Doc 00")).toBeTruthy();
    });
    expect(screen.queryByText("Paged Doc 11")).toBeNull();
    await user.click(screen.getByRole("button", { name: /Next/i }));
    await waitFor(() => {
      expect(screen.getByText("Paged Doc 11")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Previous/i }));
    await waitFor(() => {
      expect(screen.getByText("Paged Doc 00")).toBeTruthy();
    });
  });

  it("filters folders collections and tags by row click", async () => {
    const user = userEvent.setup();
    const { unmount } = render(wrap(<PlatformDocumentsView section="folders" />));
    await waitFor(() => {
      expect(screen.getByText("folder_policies")).toBeTruthy();
    });
    await user.click(screen.getByTestId("documents-row-folder_policies"));
    unmount();

    render(wrap(<PlatformDocumentsView section="tags" />));
    await waitFor(() => {
      expect(screen.getByText("policy")).toBeTruthy();
    });
    await user.click(screen.getByTestId("documents-row-policy"));
  });

  it("router resolves overview section", async () => {
    render(wrap(<DocumentsWorkspaceRouter />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
    });
  });
});
