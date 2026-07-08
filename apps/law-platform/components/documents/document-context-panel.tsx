"use client";

import { LawInformationCard, LawStatisticsCard, LawStatusCard } from "../ux";
import {
  getDocumentCategoryLabel,
  getDocumentFolderLabel,
  getMatterTitleForDocument,
  type Document,
} from "../../lib/documents";
import { matterDetailRoute } from "../../lib/matters";

export interface DocumentContextPanelProps {
  readonly document?: Document;
}

function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Context panel — document summary with matter link and placeholder activity/timeline (LAW-004-01). */
export function DocumentContextPanel({ document }: DocumentContextPanelProps) {
  if (!document) {
    return (
      <aside
        className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        data-testid="document-context-panel-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select a document to preview summary, activity, and timeline placeholders.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col gap-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      data-testid="document-context-panel"
    >
      <LawStatisticsCard
        label="Document reference"
        value={document.documentReference}
      />
      <LawStatusCard
        label="Status"
        status={document.documentStatus}
        tone={
          document.documentStatus === "approved" || document.documentStatus === "filed"
            ? "success"
            : "neutral"
        }
      />
      <LawInformationCard title="Document summary">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Title</dt>
            <dd className="font-medium text-[var(--color-foreground)]">
              {document.title}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Matter</dt>
            <dd>
              <a
                href={matterDetailRoute(document.matterId)}
                className="font-medium text-[var(--law-accent)] hover:underline"
                data-testid="document-context-matter-link"
              >
                {getMatterTitleForDocument(document.matterId)}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Category</dt>
            <dd className="text-[var(--color-foreground)]">
              {getDocumentCategoryLabel(document.documentCategoryId)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Folder</dt>
            <dd className="text-[var(--color-foreground)]">
              {getDocumentFolderLabel(document.folderId)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Type</dt>
            <dd className="capitalize text-[var(--color-foreground)]">
              {document.documentType}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Version</dt>
            <dd className="text-[var(--color-foreground)]">{document.version}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Tags</dt>
            <dd className="text-[var(--color-foreground)]">
              {document.tags.length > 0 ? document.tags.join(", ") : "None"}
            </dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="File info">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">File name</dt>
            <dd className="break-all font-mono text-xs text-[var(--color-foreground)]">
              {document.fileName || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">MIME type</dt>
            <dd className="text-[var(--color-foreground)]">
              {document.mimeType || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Size</dt>
            <dd className="text-[var(--color-foreground)]">
              {formatBytes(document.sizeBytes)}
            </dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Activity (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Document opened, created, and edited activities will appear here when wired to
          the Activity framework.
        </p>
      </LawInformationCard>
      <LawInformationCard title="Timeline (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Timeline entries for this document will appear here in a future story.
        </p>
      </LawInformationCard>
    </aside>
  );
}
