"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  LawBreadcrumbs,
  LawDetailPageLayout,
  LawEmptyState,
  LawInformationCard,
  LawPageHeader,
  LawPageHeaderButton,
  LawStatisticsCard,
  LawStatusCard,
  LawTabs,
} from "../ux";
import { DocumentContextPanel } from "./document-context-panel";
import { useDocumentWorkflow } from "../../lib/documents/document-workflow-context";
import {
  documentEditRoute,
  documentListRoute,
  getDocumentCategoryLabel,
  getDocumentFolderLabel,
  getMatterTitleForDocument,
  getSharedDocumentRepository,
  type Document,
} from "../../lib/documents";
import { matterDetailRoute } from "../../lib/matters";

const DETAIL_TABS = [
  { id: "notes", label: "Notes" },
  { id: "versions", label: "Versions" },
  { id: "activities", label: "Activities" },
  { id: "timeline", label: "Timeline" },
] as const;

export interface DocumentDetailPageProps {
  readonly documentId: string;
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

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function PropertyGrid({ document }: { readonly document: Document }) {
  const entries: Array<{
    label: string;
    value: string;
    href?: string;
    testId?: string;
  }> = [
    { label: "Document ID", value: document.documentId },
    { label: "Reference", value: document.documentReference },
    { label: "Title", value: document.title },
    { label: "Type", value: formatLabel(document.documentType) },
    { label: "Status", value: formatLabel(document.documentStatus) },
    { label: "Category", value: getDocumentCategoryLabel(document.documentCategoryId) },
    {
      label: "Matter",
      value: getMatterTitleForDocument(document.matterId),
      href: matterDetailRoute(document.matterId),
      testId: "document-detail-matter-link",
    },
    { label: "Matter ID", value: document.matterId },
    { label: "Folder", value: getDocumentFolderLabel(document.folderId) },
    { label: "Version", value: String(document.version) },
    { label: "File name", value: document.fileName || "—" },
    { label: "MIME type", value: document.mimeType || "—" },
    { label: "Size", value: formatBytes(document.sizeBytes) },
    { label: "Created by", value: document.createdByUserId },
    { label: "Tags", value: document.tags.length > 0 ? document.tags.join(", ") : "—" },
    {
      label: "Custom fields",
      value:
        Object.keys(document.customFields).length > 0
          ? Object.entries(document.customFields)
              .map(([key, value]) => `${key}=${value}`)
              .join("; ")
          : "—",
    },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2" data-testid="document-detail-properties">
      {entries.map((entry) => (
        <div key={entry.label}>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {entry.label}
          </dt>
          <dd className="mt-1 text-sm text-[var(--color-foreground)]">
            {entry.href ? (
              <a
                href={entry.href}
                className="font-medium text-[var(--law-accent)] hover:underline"
                data-testid={entry.testId}
              >
                {entry.value}
              </a>
            ) : (
              entry.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Document detail page — LawDetailPageLayout with workflow open/archive (LAW-004-01). */
export function DocumentDetailPage({ documentId }: DocumentDetailPageProps) {
  const router = useRouter();
  const workflow = useDocumentWorkflow();
  const repository = getSharedDocumentRepository();
  const document = useMemo(
    () => repository.getById(documentId),
    [repository, documentId],
  );
  const [activeTab, setActiveTab] = useState<string>("notes");
  const openedDocumentIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!document || openedDocumentIdRef.current === document.documentId) {
      return;
    }

    openedDocumentIdRef.current = document.documentId;
    workflow.openDocument(document.documentId);
  }, [document, workflow]);

  function handleArchive() {
    const result = workflow.archiveDocument(documentId);
    if (result.ok) {
      router.push(documentListRoute());
    }
  }

  if (!document) {
    return (
      <LawDetailPageLayout
        header={
          <LawPageHeader
            eyebrow="Document Management"
            title="Document not found"
            subtitle="The requested document is not in the in-memory repository."
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(documentListRoute())}>
                Back to documents
              </LawPageHeaderButton>
            }
          />
        }
        properties={<LawEmptyState variant="no-results" />}
      />
    );
  }

  return (
    <LawDetailPageLayout
      header={
        <>
          <LawBreadcrumbs
            items={[
              { label: "Documents", href: documentListRoute() },
              { label: document.title },
            ]}
          />
          <LawPageHeader
            eyebrow="Document Management"
            title={document.title}
            subtitle={document.documentReference}
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(documentEditRoute(document.documentId))}
              >
                Edit Document
              </LawPageHeaderButton>
            }
            secondaryActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(documentListRoute())}
                >
                  Back to list
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleArchive}
                  data-testid="document-archive-button"
                >
                  Archive Document
                </Button>
              </>
            }
          />
        </>
      }
      summaryCards={
        <>
          <LawStatisticsCard label="Reference" value={document.documentReference} />
          <LawStatusCard
            label="Status"
            status={formatLabel(document.documentStatus)}
            tone={
              document.documentStatus === "approved" ||
              document.documentStatus === "filed"
                ? "success"
                : "neutral"
            }
          />
          <LawStatisticsCard
            label="Matter"
            value={getMatterTitleForDocument(document.matterId)}
          />
          <LawStatisticsCard label="Version" value={String(document.version)} />
        </>
      }
      tabs={
        <>
          <LawTabs items={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />
          <LawInformationCard
            title={`${DETAIL_TABS.find((tab) => tab.id === activeTab)?.label ?? "Tab"} (placeholder)`}
          >
            <p
              className="text-sm text-[var(--color-muted-foreground)]"
              data-testid={`document-tab-${activeTab}`}
            >
              {activeTab === "notes" &&
                "Document notes will be managed in a future story."}
              {activeTab === "versions" &&
                "Document version history will appear here when version control is implemented."}
              {activeTab === "activities" &&
                "Activity entries will be sourced from the Activity framework."}
              {activeTab === "timeline" &&
                "Timeline events will be sourced from the Activity & Timeline framework."}
            </p>
          </LawInformationCard>
        </>
      }
      properties={
        <LawInformationCard title="Properties">
          <PropertyGrid document={document} />
        </LawInformationCard>
      }
      timeline={
        <LawInformationCard title="Timeline (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Timeline integration is registered but not wired to live updates in
            LAW-004-01.
          </p>
        </LawInformationCard>
      }
      documents={
        <LawInformationCard title="Related documents (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Related document links will appear here in a future story.
          </p>
        </LawInformationCard>
      }
      activity={
        <LawInformationCard title="Activity (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Document opened, created, and edited activities are registered as
            placeholders.
          </p>
        </LawInformationCard>
      }
      contextPanel={<DocumentContextPanel document={document} />}
    />
  );
}
