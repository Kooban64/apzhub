"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  LawEmptyState,
  LawFilterBar,
  LawListPageLayout,
  LawPageHeader,
  LawPageHeaderButton,
  LawPagination,
  LawSearchBar,
  LawTableLoadingSkeleton,
} from "../ux";
import { DocumentContextPanel } from "./document-context-panel";
import { DocumentListTable } from "./document-list-table";
import { useDocumentWorkflow } from "../../lib/documents/document-workflow-context";
import {
  DOCUMENT_STATUSES,
  documentCreateRoute,
  documentDetailRoute,
  getSharedDocumentRepository,
  SEED_DOCUMENT_CATEGORIES,
  SEED_FOLDERS,
  type Document,
  type DocumentStatus,
} from "../../lib/documents";
import { getSharedMatterRepository } from "../../lib/matters";

const PAGE_SIZE = 10;

export interface DocumentListPageProps {
  readonly initialQuery?: string;
}

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Document list page — LawListPageLayout with workflow search (LAW-004-01). */
export function DocumentListPage({ initialQuery = "" }: DocumentListPageProps) {
  const router = useRouter();
  const workflow = useDocumentWorkflow();
  const repository = getSharedDocumentRepository();
  const matters = useMemo(() => getSharedMatterRepository().list(), []);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [matterFilter, setMatterFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, categoryFilter, folderFilter, matterFilter]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      workflow.searchDocuments({
        query,
        documentStatus: statusFilter,
        documentCategoryId: categoryFilter,
        folderId: folderFilter,
        matterId: matterFilter,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [
    loading,
    query,
    statusFilter,
    categoryFilter,
    folderFilter,
    matterFilter,
    workflow,
  ]);

  const filteredDocuments = useMemo(
    () =>
      repository.list({
        query,
        documentStatus: statusFilter,
        documentCategoryId: categoryFilter,
        folderId: folderFilter,
        matterId: matterFilter,
      }),
    [repository, query, statusFilter, categoryFilter, folderFilter, matterFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE));
  const pageDocuments = filteredDocuments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const selectClassName =
    "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm";

  return (
    <div data-testid="document-list-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Document Management"
            title="Documents"
            subtitle="Browse and search the firm document register. Data is in-memory only for UX validation."
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(documentCreateRoute())}
                data-testid="document-create-button"
              >
                Upload Document
              </LawPageHeaderButton>
            }
          />
        }
        toolbar={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(documentCreateRoute())}
              data-testid="document-toolbar-upload"
            >
              Upload document
            </Button>
          </div>
        }
        searchArea={
          <LawSearchBar
            placeholder="Search documents by title, reference, file name, tag, or status…"
            value={query}
            onChange={setQuery}
            data-testid="document-search-bar"
          />
        }
        filtersArea={
          <LawFilterBar label="Document filters">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Status</span>
              <select
                className={selectClassName}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as DocumentStatus | "all")
                }
                data-testid="document-filter-status"
              >
                <option value="all">All statuses</option>
                {DOCUMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Category</span>
              <select
                className={selectClassName}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                data-testid="document-filter-category"
              >
                <option value="all">All categories</option>
                {SEED_DOCUMENT_CATEGORIES.map((category) => (
                  <option
                    key={category.documentCategoryId}
                    value={category.documentCategoryId}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Folder</span>
              <select
                className={selectClassName}
                value={folderFilter}
                onChange={(event) => setFolderFilter(event.target.value)}
                data-testid="document-filter-folder"
              >
                <option value="all">All folders</option>
                {SEED_FOLDERS.map((folder) => (
                  <option key={folder.folderId} value={folder.folderId}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Matter</span>
              <select
                className={selectClassName}
                value={matterFilter}
                onChange={(event) => setMatterFilter(event.target.value)}
                data-testid="document-filter-matter"
              >
                <option value="all">All matters</option>
                {matters.map((matter) => (
                  <option key={matter.matterId} value={matter.matterId}>
                    {matter.title}
                  </option>
                ))}
              </select>
            </label>
          </LawFilterBar>
        }
        state={
          loading ? (
            <LawTableLoadingSkeleton />
          ) : filteredDocuments.length === 0 ? (
            <LawEmptyState
              variant={repository.count() === 0 ? "no-documents" : "no-results"}
            />
          ) : null
        }
        table={
          loading ? (
            <div aria-hidden="true" />
          ) : (
            <DocumentListTable
              documents={pageDocuments}
              selectedDocumentId={selectedDocument?.documentId}
              onSelect={setSelectedDocument}
              onOpen={(document) =>
                router.push(documentDetailRoute(document.documentId))
              }
            />
          )
        }
        pagination={
          loading ? null : (
            <LawPagination
              page={page}
              pageCount={pageCount}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => Math.min(pageCount, current + 1))}
            />
          )
        }
        contextPanel={<DocumentContextPanel document={selectedDocument} />}
      />
    </div>
  );
}
