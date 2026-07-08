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
import { MatterContextPanel } from "./matter-context-panel";
import { useMatterWorkflow } from "../../lib/matters/matter-workflow-context";
import {
  getClientDisplayName,
  getLeadAttorneyLabel,
  getMatterStatusLabel,
  getMatterTypeLabel,
  getPracticeAreaLabel,
  getSharedMatterRepository,
  matterEditRoute,
  matterListRoute,
  matterWorkspaceRoute,
  type Matter,
} from "../../lib/matters";

const DETAIL_TABS = [
  { id: "notes", label: "Notes" },
  { id: "documents", label: "Documents" },
  { id: "tasks", label: "Tasks" },
  { id: "activities", label: "Activities" },
  { id: "timeline", label: "Timeline" },
] as const;

export interface MatterDetailPageProps {
  readonly matterId: string;
}

function PropertyGrid({ matter }: { readonly matter: Matter }) {
  const entries: Array<{ label: string; value: string }> = [
    { label: "Matter ID", value: matter.matterId },
    { label: "Reference", value: matter.matterReference },
    { label: "Title", value: matter.title },
    { label: "Description", value: matter.description ?? "—" },
    { label: "Client", value: getClientDisplayName(matter.clientId) },
    { label: "Matter type", value: getMatterTypeLabel(matter.matterTypeId) },
    { label: "Practice area", value: getPracticeAreaLabel(matter.practiceAreaId) },
    { label: "Status", value: getMatterStatusLabel(matter.matterStatus) },
    { label: "Priority", value: matter.priority },
    { label: "Lead attorney", value: getLeadAttorneyLabel(matter.leadAttorneyId) },
    { label: "Opened at", value: matter.openedAt ?? "—" },
    { label: "Closed at", value: matter.closedAt ?? "—" },
    { label: "Tags", value: matter.tags.length > 0 ? matter.tags.join(", ") : "—" },
    {
      label: "Custom fields",
      value:
        Object.keys(matter.customFields).length > 0
          ? Object.entries(matter.customFields)
              .map(([key, value]) => `${key}=${value}`)
              .join("; ")
          : "—",
    },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <div key={entry.label}>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {entry.label}
          </dt>
          <dd className="mt-1 text-sm text-[var(--color-foreground)]">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Matter detail page — LawDetailPageLayout with workflow open/archive (LAW-003-01). */
export function MatterDetailPage({ matterId }: MatterDetailPageProps) {
  const router = useRouter();
  const workflow = useMatterWorkflow();
  const repository = getSharedMatterRepository();
  const matter = useMemo(() => repository.getById(matterId), [repository, matterId]);
  const [activeTab, setActiveTab] = useState<string>("notes");
  const openedMatterIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!matter || openedMatterIdRef.current === matter.matterId) {
      return;
    }

    openedMatterIdRef.current = matter.matterId;
    workflow.openMatter(matter.matterId);
  }, [matter, workflow]);

  function handleArchive() {
    const result = workflow.archiveMatter(matterId);
    if (result.ok) {
      router.push(matterListRoute());
    }
  }

  if (!matter) {
    return (
      <LawDetailPageLayout
        header={
          <LawPageHeader
            eyebrow="Matter Management"
            title="Matter not found"
            subtitle="The requested matter is not in the in-memory repository."
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(matterListRoute())}>
                Back to matters
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
              { label: "Matters", href: matterListRoute() },
              { label: matter.title },
            ]}
          />
          <LawPageHeader
            eyebrow="Matter Management"
            title={matter.title}
            subtitle={matter.matterReference}
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(matterEditRoute(matter.matterId))}
              >
                Edit Matter
              </LawPageHeaderButton>
            }
            secondaryActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(matterListRoute())}
                >
                  Back to list
                </Button>
                <LawPageHeaderButton
                  onClick={() => router.push(matterWorkspaceRoute(matter.matterId))}
                >
                  Open workspace
                </LawPageHeaderButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleArchive}
                  data-testid="matter-archive-button"
                >
                  Archive Matter
                </Button>
              </>
            }
          />
        </>
      }
      summaryCards={
        <>
          <LawStatisticsCard label="Reference" value={matter.matterReference} />
          <LawStatusCard
            label="Status"
            status={getMatterStatusLabel(matter.matterStatus)}
            tone={matter.matterStatus === "open" ? "success" : "neutral"}
          />
          <LawStatisticsCard
            label="Client"
            value={getClientDisplayName(matter.clientId)}
          />
          <LawStatisticsCard label="Priority" value={matter.priority} />
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
              data-testid={`matter-tab-${activeTab}`}
            >
              {activeTab === "notes" &&
                "Matter notes will be managed in a future story."}
              {activeTab === "documents" &&
                "Matter documents will appear here when Document Management is implemented."}
              {activeTab === "tasks" &&
                "Matter tasks will appear here when Task Management is implemented."}
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
          <PropertyGrid matter={matter} />
        </LawInformationCard>
      }
      timeline={
        <LawInformationCard title="Timeline (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Timeline integration is registered but not wired to live updates in
            LAW-003-01.
          </p>
        </LawInformationCard>
      }
      documents={
        <LawInformationCard title="Documents (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Document links will appear here in LAW-004.
          </p>
        </LawInformationCard>
      }
      activity={
        <LawInformationCard title="Activity (placeholder)">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Matter opened, created, and edited activities are registered as
            placeholders.
          </p>
        </LawInformationCard>
      }
      contextPanel={<MatterContextPanel matter={matter} />}
    />
  );
}
