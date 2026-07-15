"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import {
  getDiagnostics,
  getDocument,
  getStorageMetadata,
  listAudit,
  listDocuments,
  listVersions,
} from "@/lib/documents/document-api";
import { toDocumentUserMessage } from "@/lib/documents/document-errors";
import type {
  DocumentSummaryViewModel,
  DocumentVersionViewModel,
} from "@/lib/documents/document-types";
import type { DocumentsSection } from "@/lib/documents/routes";

function PageShell({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="documents-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Documents
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="documents-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid="documents-error"
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        Unable to load documents
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      {onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function DocumentsTable({
  columns,
  rows,
  caption,
  onRowClick,
  selectedId,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly caption?: string;
  readonly onRowClick?: (id: string) => void;
  readonly selectedId?: string | null;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid="documents-table"
    >
      <table className="min-w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-3 py-2 font-medium text-[var(--color-foreground)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={[
                "border-b border-[var(--color-border)]",
                onRowClick ? "cursor-pointer hover:bg-[var(--color-muted)]/20" : "",
                selectedId === row.id ? "bg-[var(--color-muted)]/30" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={onRowClick ? () => onRowClick(row.id) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row.id);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              aria-selected={selectedId === row.id ? true : undefined}
              data-testid={`documents-row-${row.id}`}
            >
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.id}-${index}`}
                  className="px-3 py-2 text-[var(--color-foreground)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function paginate<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function sortDocuments(
  items: readonly DocumentSummaryViewModel[],
  sort: "title" | "status" | "updated" | "classification",
  order: "asc" | "desc",
): DocumentSummaryViewModel[] {
  const dir = order === "asc" ? 1 : -1;
  return items.slice().sort((a, b) => {
    if (sort === "status") return a.status.localeCompare(b.status) * dir;
    if (sort === "updated") return a.updatedAt.localeCompare(b.updatedAt) * dir;
    if (sort === "classification") {
      return a.classification.localeCompare(b.classification) * dir;
    }
    return a.title.localeCompare(b.title) * dir;
  });
}

async function copyText(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  throw new Error("Clipboard is unavailable.");
}

const SECTION_TITLES: Record<DocumentsSection, string> = {
  overview: "Overview",
  documents: "Documents",
  versions: "Versions",
  collections: "Collections",
  folders: "Folders",
  tags: "Tags",
  relationships: "Relationships",
  retention: "Retention",
  audit: "Audit",
  diagnostics: "Diagnostics",
  metadata: "Metadata",
};

export function PlatformDocumentsView({
  section = "overview",
}: {
  readonly section?: DocumentsSection;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [sortBy, setSortBy] = useState<
    "title" | "status" | "updated" | "classification"
  >("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  const [detailPanel, setDetailPanel] = useState<
    | "metadata"
    | "versions"
    | "relationships"
    | "retention"
    | "audit"
    | "folder"
    | "collection"
    | "diagnostics"
    | null
  >(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const pageSize = 10;

  const documentsQuery = useQuery({
    queryKey: [
      "documents",
      "list",
      statusFilter,
      classificationFilter,
      tagFilter,
    ],
    queryFn: ({ signal }) =>
      listDocuments(
        {
          status: statusFilter || undefined,
          classification: classificationFilter || undefined,
          tagName: tagFilter || undefined,
          limit: 100,
        },
        { signal },
      ),
  });

  const selectedId =
    selectedDocumentId ?? documentsQuery.data?.items[0]?.documentId ?? null;

  const detailQuery = useQuery({
    queryKey: ["documents", "detail", selectedId],
    queryFn: ({ signal }) => getDocument(selectedId!, { signal }),
    enabled: Boolean(selectedId),
  });

  const versionsQuery = useQuery({
    queryKey: ["documents", "versions", selectedId],
    queryFn: ({ signal }) => listVersions(selectedId!, { signal }),
    enabled: Boolean(selectedId) && (section === "versions" || detailPanel === "versions"),
  });

  const auditQuery = useQuery({
    queryKey: ["documents", "audit", selectedId],
    queryFn: ({ signal }) => listAudit(selectedId!, { signal }),
    enabled: Boolean(selectedId) && (section === "audit" || detailPanel === "audit"),
  });

  const diagnosticsQuery = useQuery({
    queryKey: ["documents", "diagnostics"],
    queryFn: ({ signal }) => getDiagnostics({ signal }),
    enabled: section === "diagnostics" || detailPanel === "diagnostics",
  });

  const selectedVersion =
    versionsQuery.data?.items.find((v) => v.id === selectedVersionId) ??
    versionsQuery.data?.items[0] ??
    null;

  const storageQuery = useQuery({
    queryKey: ["documents", "storage", selectedId, selectedVersion?.id],
    queryFn: ({ signal }) =>
      getStorageMetadata(selectedId!, selectedVersion!.id, { signal }),
    enabled:
      Boolean(selectedId && selectedVersion) &&
      (section === "versions" || section === "metadata" || detailPanel === "metadata"),
  });

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = (documentsQuery.data?.items ?? []).filter((item) => {
      if (folderFilter && item.folderId !== folderFilter) return false;
      if (collectionFilter && item.collectionId !== collectionFilter) return false;
      if (ownerFilter && item.ownerUserId !== ownerFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.documentId.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.classification.toLowerCase().includes(q) ||
        item.tagNames.some((tag) => tag.toLowerCase().includes(q))
      );
    });
    return sortDocuments(items, sortBy, order);
  }, [
    documentsQuery.data?.items,
    search,
    folderFilter,
    collectionFilter,
    ownerFilter,
    sortBy,
    order,
  ]);

  const pagedDocuments = paginate(filteredDocuments, page, pageSize);

  const folderRows = useMemo(() => {
    const map = new Map<string, number>();
    for (const doc of filteredDocuments) {
      const key = doc.folderId ?? "(unassigned)";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].map(([id, count]) => ({ id, count }));
  }, [filteredDocuments]);

  const collectionRows = useMemo(() => {
    const map = new Map<string, number>();
    for (const doc of filteredDocuments) {
      const key = doc.collectionId ?? "(unassigned)";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].map(([id, count]) => ({ id, count }));
  }, [filteredDocuments]);

  const tagRows = useMemo(() => {
    const map = new Map<string, number>();
    for (const doc of filteredDocuments) {
      for (const tag of doc.tagNames) {
        map.set(tag, (map.get(tag) ?? 0) + 1);
      }
    }
    return [...map.entries()].map(([id, count]) => ({ id, count }));
  }, [filteredDocuments]);

  async function refreshAll() {
    setActionError(null);
    setStatusMessage("Refreshed.");
    await Promise.all([
      documentsQuery.refetch(),
      detailQuery.refetch(),
      versionsQuery.refetch(),
      auditQuery.refetch(),
      diagnosticsQuery.refetch(),
      storageQuery.refetch(),
    ]);
  }

  async function copyDocumentId() {
    if (!selectedId) {
      setActionError("Select a document first.");
      return;
    }
    try {
      await copyText(selectedId);
      setStatusMessage(`Copied document ID ${selectedId}`);
      setActionError(null);
    } catch (error) {
      setActionError(toDocumentUserMessage(error));
    }
  }

  async function copyVersionId() {
    const versionId = selectedVersion?.id;
    if (!versionId) {
      setActionError("Select a version first (open Versions).");
      return;
    }
    try {
      await copyText(versionId);
      setStatusMessage(`Copied version ID ${versionId}`);
      setActionError(null);
    } catch (error) {
      setActionError(toDocumentUserMessage(error));
    }
  }

  const commands = (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Documents commands"
    >
      <Button type="button" variant="outline" size="sm" onClick={() => void refreshAll()}>
        Refresh
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => setDetailPanel("metadata")}
      >
        View Metadata
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => setDetailPanel("versions")}
      >
        View Versions
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => setDetailPanel("relationships")}
      >
        View Relationships
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => setDetailPanel("retention")}
      >
        View Retention
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => setDetailPanel("audit")}
      >
        View Audit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => setDetailPanel("folder")}
      >
        Open Folder
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => setDetailPanel("collection")}
      >
        Open Collection
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setDetailPanel("diagnostics")}
      >
        Inspect Diagnostics
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => void copyDocumentId()}
      >
        Copy Document ID
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedVersion}
        onClick={() => void copyVersionId()}
      >
        Copy Version ID
      </Button>
    </div>
  );

  const filters = (
    <div className="flex flex-wrap items-end gap-3" data-testid="documents-filters">
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Search
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Filter by metadata…"
          aria-label="Filter documents by metadata"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Status
        <Input
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          placeholder="status"
          aria-label="Filter by status"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Classification
        <Input
          value={classificationFilter}
          onChange={(event) => {
            setClassificationFilter(event.target.value);
            setPage(1);
          }}
          placeholder="classification"
          aria-label="Filter by classification"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Tag
        <Input
          value={tagFilter}
          onChange={(event) => {
            setTagFilter(event.target.value);
            setPage(1);
          }}
          placeholder="tag"
          aria-label="Filter by tag"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Folder
        <Input
          value={folderFilter}
          onChange={(event) => {
            setFolderFilter(event.target.value);
            setPage(1);
          }}
          placeholder="folder id"
          aria-label="Filter by folder"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Collection
        <Input
          value={collectionFilter}
          onChange={(event) => {
            setCollectionFilter(event.target.value);
            setPage(1);
          }}
          placeholder="collection id"
          aria-label="Filter by collection"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Owner
        <Input
          value={ownerFilter}
          onChange={(event) => {
            setOwnerFilter(event.target.value);
            setPage(1);
          }}
          placeholder="owner id"
          aria-label="Filter by owner"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Sort
        <select
          className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target.value as "title" | "status" | "updated" | "classification",
            )
          }
          aria-label="Sort documents"
        >
          <option value="title">Title</option>
          <option value="status">Status</option>
          <option value="classification">Classification</option>
          <option value="updated">Updated</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Order
        <select
          className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
          value={order}
          onChange={(event) => setOrder(event.target.value as "asc" | "desc")}
          aria-label="Sort order"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </div>
  );

  function renderDocumentList(caption: string) {
    if (documentsQuery.isLoading) {
      return <p role="status">Loading documents…</p>;
    }
    if (documentsQuery.isError) {
      return (
        <ErrorState
          message={toDocumentUserMessage(documentsQuery.error)}
          onRetry={() => void documentsQuery.refetch()}
        />
      );
    }
    if (pagedDocuments.length === 0) {
      return (
        <EmptyState
          title="No documents found"
          description="Adjust filters or refresh the list."
        />
      );
    }
    return (
      <>
        <DocumentsTable
          caption={caption}
          columns={["Title", "Status", "Classification", "Updated", "Tags"]}
          selectedId={selectedId}
          onRowClick={(id) => {
            setSelectedDocumentId(id);
            setSelectedVersionId(null);
          }}
          rows={pagedDocuments.map((doc) => ({
            id: doc.documentId,
            cells: [
              doc.title,
              doc.status,
              doc.classification,
              doc.updatedAt,
              doc.tagNames.join(", ") || "—",
            ],
          }))}
        />
        <div className="flex items-center justify-between gap-2 text-sm">
          <p className="text-[var(--color-muted-foreground)]" role="status">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filteredDocuments.length)} of{" "}
            {filteredDocuments.length}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page * pageSize >= filteredDocuments.length}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </>
    );
  }

  function renderDetailPanel() {
    if (!detailPanel) return null;
    const detail = detailQuery.data;
    return (
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        aria-label="Document detail panel"
        data-testid="documents-detail-panel"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            {detailPanel === "metadata"
              ? "Metadata"
              : detailPanel === "versions"
                ? "Versions"
                : detailPanel === "relationships"
                  ? "Relationships"
                  : detailPanel === "retention"
                    ? "Retention"
                    : detailPanel === "audit"
                      ? "Audit"
                      : detailPanel === "folder"
                        ? "Folder"
                        : detailPanel === "collection"
                          ? "Collection"
                          : "Diagnostics"}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDetailPanel(null)}
          >
            Close
          </Button>
        </div>
        {detailPanel === "diagnostics" ? (
          diagnosticsQuery.isLoading ? (
            <p role="status">Loading diagnostics…</p>
          ) : diagnosticsQuery.isError ? (
            <ErrorState message={toDocumentUserMessage(diagnosticsQuery.error)} />
          ) : (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {Object.entries(diagnosticsQuery.data ?? {}).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-[var(--color-muted-foreground)]">{key}</dt>
                  <dd className="font-medium text-[var(--color-foreground)]">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )
        ) : !selectedId ? (
          <EmptyState title="Select a document" />
        ) : detailQuery.isLoading ? (
          <p role="status">Loading document…</p>
        ) : detailQuery.isError ? (
          <ErrorState message={toDocumentUserMessage(detailQuery.error)} />
        ) : detailPanel === "metadata" ? (
          <div className="space-y-3 text-sm">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Document ID</dt>
                <dd>{detail?.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Title</dt>
                <dd>{detail?.title}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                <dd>{detail?.status}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Classification</dt>
                <dd>{detail?.classification}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Type</dt>
                <dd>{detail?.documentType}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
                <dd>{detail?.ownerUserId ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[var(--color-muted-foreground)]">Description</dt>
                <dd>{detail?.description ?? "—"}</dd>
              </div>
            </dl>
            {storageQuery.data ? (
              <div data-testid="documents-storage-metadata">
                <h3 className="mb-1 font-medium">Storage / checksum metadata</h3>
                <p>Status: {storageQuery.data.version.storageStatus}</p>
                <p>Checksum: {storageQuery.data.version.checksumHex || "—"}</p>
                <p>Bytes: {storageQuery.data.version.byteLength}</p>
                <p>
                  Storage key present:{" "}
                  {storageQuery.data.version.storageKeyPresent ? "yes" : "no"}
                </p>
              </div>
            ) : null}
          </div>
        ) : detailPanel === "versions" ? (
          versionsQuery.isLoading ? (
            <p role="status">Loading versions…</p>
          ) : (
            <DocumentsTable
              caption="Document versions"
              columns={["Version", "MIME", "Bytes", "Checksum", "Storage"]}
              selectedId={selectedVersion?.id}
              onRowClick={(id) => setSelectedVersionId(id)}
              rows={(versionsQuery.data?.items ?? []).map(
                (version: DocumentVersionViewModel) => ({
                  id: version.id,
                  cells: [
                    String(version.versionNumber),
                    version.mimeType,
                    String(version.byteLength),
                    version.checksumHex || "—",
                    version.storageStatus,
                  ],
                }),
              )}
            />
          )
        ) : detailPanel === "relationships" ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Relationship metadata is read-only in this milestone. Use product
            services to create relationships; this panel confirms selection of{" "}
            <strong>{detail?.title}</strong> ({detail?.id}).
          </p>
        ) : detailPanel === "retention" ? (
          <p className="text-sm">
            Retention ID: <strong>{detail?.retentionId ?? "(none)"}</strong>
          </p>
        ) : detailPanel === "folder" ? (
          <p className="text-sm">
            Folder ID: <strong>{detail?.folderId ?? "(unassigned)"}</strong>
          </p>
        ) : detailPanel === "collection" ? (
          <p className="text-sm">
            Collection ID:{" "}
            <strong>{detail?.collectionId ?? "(unassigned)"}</strong>
          </p>
        ) : auditQuery.isLoading ? (
          <p role="status">Loading audit…</p>
        ) : (
          <DocumentsTable
            caption="Audit history"
            columns={["ID", "Action"]}
            rows={(auditQuery.data?.items ?? []).map((entry) => ({
              id: entry.id,
              cells: [entry.id, entry.action],
            }))}
          />
        )}
      </section>
    );
  }

  return (
    <PageShell
      title={SECTION_TITLES[section]}
      description="Product-neutral Document Platform workbench — metadata only; no uploads, downloads, or previews."
      actions={commands}
    >
      {actionError ? (
        <ErrorState message={actionError} onRetry={() => setActionError(null)} />
      ) : null}
      {statusMessage ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="status">
          {statusMessage}
        </p>
      ) : null}

      {section === "overview" ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Shared Document Platform metadata surface. Navigate sidebar sections
            for list, versions, organisation structures, tags, retention, audit,
            and safe diagnostics.
          </p>
          {filters}
          {renderDocumentList("Overview document list")}
          {selectedId && detailQuery.data ? (
            <section
              className="rounded-lg border border-[var(--color-border)] p-4"
              aria-label="Selected document summary"
            >
              <h2 className="text-lg font-semibold">{detailQuery.data.title}</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {detailQuery.data.id} · {detailQuery.data.status} ·{" "}
                {detailQuery.data.classification}
              </p>
            </section>
          ) : null}
        </div>
      ) : null}

      {section === "documents" || section === "metadata" ? (
        <div className="space-y-4">
          {filters}
          {renderDocumentList(
            section === "metadata" ? "Document metadata list" : "Documents list",
          )}
        </div>
      ) : null}

      {section === "versions" ? (
        <div className="space-y-4">
          {filters}
          {renderDocumentList("Documents for version history")}
          {!selectedId ? (
            <EmptyState title="Select a document to view versions" />
          ) : versionsQuery.isLoading ? (
            <p role="status">Loading versions…</p>
          ) : (versionsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No versions" description="No version metadata yet." />
          ) : (
            <DocumentsTable
              caption="Version history"
              columns={["Version", "MIME", "Bytes", "Checksum", "Status", "Created"]}
              selectedId={selectedVersion?.id}
              onRowClick={(id) => setSelectedVersionId(id)}
              rows={(versionsQuery.data?.items ?? []).map((version) => ({
                id: version.id,
                cells: [
                  String(version.versionNumber),
                  version.mimeType,
                  String(version.byteLength),
                  version.checksumHex || "—",
                  version.storageStatus,
                  version.createdAt,
                ],
              }))}
            />
          )}
          {storageQuery.data ? (
            <div
              className="rounded-lg border border-[var(--color-border)] p-4 text-sm"
              data-testid="documents-checksum-metadata"
            >
              <h2 className="mb-2 font-semibold">Checksum / storage metadata</h2>
              <p>Checksum: {storageQuery.data.version.checksumHex || "—"}</p>
              <p>Bytes: {storageQuery.data.version.byteLength}</p>
              <p>MIME: {storageQuery.data.version.mimeType}</p>
              <p>
                Storage key present:{" "}
                {storageQuery.data.version.storageKeyPresent ? "yes" : "no"}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {section === "folders" ? (
        <div className="space-y-4">
          {filters}
          {folderRows.length === 0 ? (
            <EmptyState title="No folder assignments" />
          ) : (
            <DocumentsTable
              caption="Folder assignments"
              columns={["Folder ID", "Documents"]}
              onRowClick={(id) => {
                if (id !== "(unassigned)") setFolderFilter(id);
              }}
              rows={folderRows.map((row) => ({
                id: row.id,
                cells: [row.id, String(row.count)],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "collections" ? (
        <div className="space-y-4">
          {filters}
          {collectionRows.length === 0 ? (
            <EmptyState title="No collection assignments" />
          ) : (
            <DocumentsTable
              caption="Collection assignments"
              columns={["Collection ID", "Documents"]}
              onRowClick={(id) => {
                if (id !== "(unassigned)") setCollectionFilter(id);
              }}
              rows={collectionRows.map((row) => ({
                id: row.id,
                cells: [row.id, String(row.count)],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "tags" ? (
        <div className="space-y-4">
          {filters}
          {tagRows.length === 0 ? (
            <EmptyState title="No tags" />
          ) : (
            <DocumentsTable
              caption="Document tags"
              columns={["Tag", "Documents"]}
              onRowClick={(id) => setTagFilter(id)}
              rows={tagRows.map((row) => ({
                id: row.id,
                cells: [row.id, String(row.count)],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "relationships" ? (
        <div className="space-y-4">
          {filters}
          {renderDocumentList("Documents for relationship context")}
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Relationship creation is excluded from this workbench. Use View
            Relationships on a selected document for read-only context.
          </p>
        </div>
      ) : null}

      {section === "retention" ? (
        <div className="space-y-4">
          {filters}
          {documentsQuery.isLoading ? (
            <p role="status">Loading…</p>
          ) : (
            <DocumentsTable
              caption="Retention assignments"
              columns={["Document", "Retention ID", "Status"]}
              selectedId={selectedId}
              onRowClick={(id) => setSelectedDocumentId(id)}
              rows={filteredDocuments.map((doc) => ({
                id: doc.documentId,
                cells: [
                  doc.title,
                  detailQuery.data?.id === doc.documentId
                    ? detailQuery.data.retentionId ?? "—"
                    : "—",
                  doc.status,
                ],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "audit" ? (
        <div className="space-y-4">
          {filters}
          {renderDocumentList("Documents for audit history")}
          {!selectedId ? (
            <EmptyState title="Select a document to view audit" />
          ) : auditQuery.isLoading ? (
            <p role="status">Loading audit…</p>
          ) : (auditQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No audit entries" />
          ) : (
            <DocumentsTable
              caption="Audit history"
              columns={["ID", "Action"]}
              rows={(auditQuery.data?.items ?? []).map((entry) => ({
                id: entry.id,
                cells: [entry.id, entry.action],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "diagnostics" ? (
        <div className="space-y-4">
          {diagnosticsQuery.isLoading ? (
            <p role="status">Loading diagnostics…</p>
          ) : diagnosticsQuery.isError ? (
            <ErrorState
              message={toDocumentUserMessage(diagnosticsQuery.error)}
              onRetry={() => void diagnosticsQuery.refetch()}
            />
          ) : (
            <dl
              className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 text-sm sm:grid-cols-2"
              data-testid="documents-diagnostics"
            >
              {Object.entries(diagnosticsQuery.data ?? {}).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-[var(--color-muted-foreground)]">{key}</dt>
                  <dd className="font-medium text-[var(--color-foreground)]">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Diagnostics show safe readiness metadata only — no paths, buckets,
            keys, credentials, or binary content.
          </p>
        </div>
      ) : null}

      {renderDetailPanel()}
    </PageShell>
  );
}
