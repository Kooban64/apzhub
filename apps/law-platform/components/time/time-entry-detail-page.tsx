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
import { TimeEntryContextPanel } from "./time-entry-context-panel";
import { useTimeEntryWorkflow } from "../../lib/time/time-entry-workflow-context";
import {
  formatTimeEntryAmount,
  formatTimeEntryDate,
  formatTimeEntryDateTime,
  formatTimeEntryDuration,
  formatTimeEntryRate,
  getAttorneyLabel,
  getDocumentTitleForTimeEntry,
  getMatterTitleForTimeEntry,
  getSharedTimeEntryRepository,
  getTaskTitleForTimeEntry,
  timeEntryEditRoute,
  timeEntryListRoute,
  type ManagedTimeEntry,
} from "../../lib/time";
import { documentDetailRoute } from "../../lib/documents";
import { matterDetailRoute } from "../../lib/matters";
import { taskDetailRoute } from "../../lib/tasks";

const DETAIL_TABS = [
  { id: "notes", label: "Notes" },
  { id: "activities", label: "Activities" },
  { id: "timeline", label: "Timeline" },
] as const;

export interface TimeEntryDetailPageProps {
  readonly timeEntryId: string;
}

function PropertyGrid({ entry }: { readonly entry: ManagedTimeEntry }) {
  const entries: Array<{
    label: string;
    value: string;
    href?: string;
    testId?: string;
  }> = [
    { label: "Time entry ID", value: entry.timeEntryId },
    { label: "Reference", value: entry.timeEntryReference },
    { label: "Description", value: entry.narrative },
    {
      label: "Matter",
      value: getMatterTitleForTimeEntry(entry.matterId),
      href: matterDetailRoute(entry.matterId),
      testId: "time-entry-detail-matter-link",
    },
    {
      label: "Task",
      value: entry.taskId ? getTaskTitleForTimeEntry(entry.taskId) : "—",
      href: entry.taskId ? taskDetailRoute(entry.taskId) : undefined,
      testId: "time-entry-detail-task-link",
    },
    {
      label: "Document",
      value: entry.documentId ? getDocumentTitleForTimeEntry(entry.documentId) : "—",
      href: entry.documentId ? documentDetailRoute(entry.documentId) : undefined,
      testId: "time-entry-detail-document-link",
    },
    { label: "Attorney", value: getAttorneyLabel(entry.userId) },
    { label: "Entry date", value: formatTimeEntryDate(entry.entryDate) },
    { label: "Start time", value: formatTimeEntryDateTime(entry.startTime) },
    { label: "End time", value: formatTimeEntryDateTime(entry.endTime) },
    { label: "Duration", value: formatTimeEntryDuration(entry.durationMinutes) },
    { label: "Billable", value: entry.billable ? "Yes" : "No" },
    { label: "Rate", value: formatTimeEntryRate(entry.rate) },
    { label: "Amount", value: formatTimeEntryAmount(entry.amount, entry.billable) },
    { label: "Billing status", value: entry.billingStatus },
    { label: "Created", value: formatTimeEntryDateTime(entry.createdAt) },
  ];

  return (
    <dl
      className="grid gap-3 sm:grid-cols-2"
      data-testid="time-entry-detail-properties"
    >
      {entries.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm text-[var(--color-foreground)]">
            {item.href ? (
              <a
                href={item.href}
                className="font-medium text-[var(--law-accent)] hover:underline"
                data-testid={item.testId}
              >
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Time entry detail page — LawDetailPageLayout with workflow open/delete (LAW-006-01). */
export function TimeEntryDetailPage({ timeEntryId }: TimeEntryDetailPageProps) {
  const router = useRouter();
  const workflow = useTimeEntryWorkflow();
  const repository = getSharedTimeEntryRepository();
  const entry = useMemo(
    () => repository.getById(timeEntryId),
    [repository, timeEntryId],
  );
  const [activeTab, setActiveTab] = useState<string>("notes");
  const openedEntryIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!entry || openedEntryIdRef.current === entry.timeEntryId) {
      return;
    }

    openedEntryIdRef.current = entry.timeEntryId;
    workflow.openTimeEntry(entry.timeEntryId);
  }, [entry, workflow]);

  function handleDelete() {
    const result = workflow.deleteTimeEntry(timeEntryId);
    if (result.ok) {
      router.push(timeEntryListRoute());
    }
  }

  if (!entry) {
    return (
      <LawDetailPageLayout
        header={
          <LawPageHeader
            eyebrow="Time Recording"
            title="Time entry not found"
            subtitle="The requested time entry is not in the in-memory repository."
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(timeEntryListRoute())}>
                Back to time entries
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
              { label: "Time", href: timeEntryListRoute() },
              { label: entry.timeEntryReference },
            ]}
          />
          <LawPageHeader
            eyebrow="Time Recording"
            title={entry.narrative}
            subtitle={entry.timeEntryReference}
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(timeEntryEditRoute(entry.timeEntryId))}
              >
                Edit Time Entry
              </LawPageHeaderButton>
            }
            secondaryActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(timeEntryListRoute())}
                >
                  Back to list
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  data-testid="time-entry-delete-button"
                >
                  Delete Time Entry
                </Button>
              </>
            }
          />
        </>
      }
      summaryCards={
        <>
          <LawStatisticsCard label="Reference" value={entry.timeEntryReference} />
          <LawStatusCard
            label="Billable"
            status={entry.billable ? "Billable" : "Non-billable"}
            tone={entry.billable ? "success" : "neutral"}
          />
          <LawStatisticsCard
            label="Duration"
            value={formatTimeEntryDuration(entry.durationMinutes)}
          />
          <LawStatisticsCard
            label="Amount"
            value={formatTimeEntryAmount(entry.amount, entry.billable)}
          />
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
              data-testid={`time-entry-tab-${activeTab}`}
            >
              {activeTab === "notes" &&
                "Time entry notes will be managed in a future story."}
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
          <PropertyGrid entry={entry} />
        </LawInformationCard>
      }
      timeline={
        <LawInformationCard title="Timeline (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Timeline integration is registered but not wired to live updates in
            LAW-006-01.
          </p>
        </LawInformationCard>
      }
      documents={
        <LawInformationCard title="Linked document">
          {entry.documentId ? (
            <a
              href={documentDetailRoute(entry.documentId)}
              className="text-sm font-medium text-[var(--law-accent)] hover:underline"
            >
              {getDocumentTitleForTimeEntry(entry.documentId)}
            </a>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No document linked to this time entry.
            </p>
          )}
        </LawInformationCard>
      }
      activity={
        <LawInformationCard title="Activity (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Time entry opened, created, edited, and deleted activities are registered as
            placeholders.
          </p>
        </LawInformationCard>
      }
      contextPanel={<TimeEntryContextPanel timeEntry={entry} />}
    />
  );
}
