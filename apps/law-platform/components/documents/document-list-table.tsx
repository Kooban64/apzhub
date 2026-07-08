"use client";

import {
  getDocumentCategoryLabel,
  getDocumentFolderLabel,
  getMatterTitleForDocument,
  type Document,
} from "../../lib/documents";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { LawStatusBadge } from "../ux/law-status-badge";

export interface DocumentListTableProps {
  readonly documents: readonly Document[];
  readonly selectedDocumentId?: string;
  readonly onSelect?: (document: Document) => void;
  readonly onOpen?: (document: Document) => void;
}

const COLUMNS: ReadonlyArray<{
  readonly id: string;
  readonly header: string;
  readonly width?: string;
}> = [
  { id: "documentReference", header: "Reference", width: "10rem" },
  { id: "title", header: "Title" },
  { id: "matter", header: "Matter", width: "12rem" },
  { id: "category", header: "Category", width: "9rem" },
  { id: "folder", header: "Folder", width: "9rem" },
  { id: "documentType", header: "Type", width: "8rem" },
  { id: "documentStatus", header: "Status", width: "8rem" },
  { id: "fileName", header: "File name", width: "12rem" },
] as const;

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Document list table — standardised shell with status badges (LAW-013-05). */
export function DocumentListTable({
  documents,
  selectedDocumentId,
  onSelect,
  onOpen,
}: DocumentListTableProps) {
  return (
    <LawListTableShell
      columns={COLUMNS}
      testId="document-list-table"
      isEmpty={documents.length === 0}
      emptyMessage="No documents match the current filters."
    >
      {documents.map((document) => {
        const selected = document.documentId === selectedDocumentId;

        return (
          <tr
            key={document.documentId}
            data-testid={`document-list-row-${document.documentReference}`}
            className={selected ? "bg-[var(--color-muted)]/30" : undefined}
            onClick={() => onSelect?.(document)}
          >
            <td className="px-4 py-3 font-mono text-xs text-[var(--color-foreground)]">
              {document.documentReference}
            </td>
            <td className="px-4 py-3 text-[var(--color-foreground)]">
              {document.title}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getMatterTitleForDocument(document.matterId)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getDocumentCategoryLabel(document.documentCategoryId)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getDocumentFolderLabel(document.folderId)}
            </td>
            <td className="px-4 py-3 capitalize text-[var(--color-muted-foreground)]">
              {formatLabel(document.documentType)}
            </td>
            <td className="px-4 py-3">
              <LawStatusBadge status={document.documentStatus} />
            </td>
            <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted-foreground)]">
              {document.fileName || "—"}
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                className="text-sm font-medium text-[var(--law-accent)] hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen?.(document);
                }}
                data-testid={`document-open-${document.documentReference}`}
              >
                Open
              </button>
            </td>
          </tr>
        );
      })}
    </LawListTableShell>
  );
}
