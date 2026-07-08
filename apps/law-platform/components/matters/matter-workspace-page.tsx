"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  LawActivityFeed,
  LawBreadcrumbs,
  LawEmptyState,
  LawInformationCard,
  LawLinkList,
  LawNotificationFeed,
  LawPageHeader,
  LawPageHeaderButton,
  LawWorkspaceLayout,
} from "../ux";
import { MatterWorkspaceContextPanel } from "./matter-workspace-context-panel";
import { MatterWorkspaceSearchSection } from "./matter-workspace-search-section";
import { useMatterWorkflow } from "../../lib/matters/matter-workflow-context";
import {
  composeMatterWorkspaceSnapshot,
  getSharedMatterRepository,
  matterDetailRoute,
  matterEditRoute,
  matterListRoute,
  type MatterWorkspaceSnapshot,
} from "../../lib/matters";

export interface MatterWorkspacePageProps {
  readonly matterId: string;
}

function SummaryGrid({
  label,
  items,
}: {
  readonly label: string;
  readonly items: readonly { label: string; value: string }[];
}) {
  return (
    <LawInformationCard title={label}>
      <dl className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm text-[var(--color-foreground)]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </LawInformationCard>
  );
}

/** Primary matter workspace — composes validated modules (LAW-009-01). */
export function MatterWorkspacePage({ matterId }: MatterWorkspacePageProps) {
  const router = useRouter();
  const workflow = useMatterWorkflow();
  const repository = getSharedMatterRepository();
  const matter = useMemo(() => repository.getById(matterId), [repository, matterId]);
  const [snapshot, setSnapshot] = useState<MatterWorkspaceSnapshot | undefined>();
  const openedRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!matter || openedRef.current === matter.matterId) {
      return;
    }

    openedRef.current = matter.matterId;
    const result = workflow.openMatterWorkspace(matter.matterId);
    if (result.ok && result.matter && "matterTitle" in result.matter) {
      setSnapshot(result.matter);
    }
  }, [matter, workflow]);

  useEffect(() => {
    if (matter && !snapshot) {
      setSnapshot(composeMatterWorkspaceSnapshot(matter));
    }
  }, [matter, snapshot]);

  function handleRefresh() {
    const result = workflow.refreshMatterWorkspace(matterId);
    if (result.ok && result.matter && "matterTitle" in result.matter) {
      setSnapshot(result.matter);
    }
  }

  if (!matter) {
    return (
      <LawWorkspaceLayout
        header={
          <LawPageHeader
            eyebrow="Matter Workspace"
            title="Matter not found"
            subtitle="The requested matter is not in the in-memory repository."
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(matterListRoute())}>
                Back to matters
              </LawPageHeaderButton>
            }
          />
        }
      >
        <LawEmptyState variant="no-results" />
      </LawWorkspaceLayout>
    );
  }

  const workspace = snapshot ?? composeMatterWorkspaceSnapshot(matter);

  return (
    <div data-testid="matter-workspace-page">
      <LawWorkspaceLayout
        header={
          <>
            <LawBreadcrumbs
              items={[
                { label: "Matters", href: matterListRoute() },
                { label: matter.title, href: matterDetailRoute(matterId) },
                { label: "Workspace" },
              ]}
            />
            <LawPageHeader
              eyebrow="Matter Workspace"
              title={workspace.matterTitle}
              subtitle={workspace.matter.matterReference}
              primaryAction={
                <LawPageHeaderButton
                  onClick={() => router.push(matterEditRoute(matterId))}
                >
                  Edit matter
                </LawPageHeaderButton>
              }
              secondaryActions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(matterDetailRoute(matterId))}
                  >
                    Matter detail
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRefresh}
                    data-testid="matter-workspace-refresh-button"
                  >
                    Refresh workspace
                  </Button>
                </>
              }
            />
          </>
        }
        toolbar={
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Composed from in-memory Clients, Documents, Tasks, Time, Calendar, Search,
            Activity, and Notification modules — no duplicate implementations.
          </p>
        }
        contextPanel={<MatterWorkspaceContextPanel snapshot={workspace} />}
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <SummaryGrid
            label="Matter summary"
            items={[
              { label: "Reference", value: workspace.matter.matterReference },
              { label: "Status", value: workspace.matter.status },
              { label: "Priority", value: workspace.matter.priority },
              { label: "Practice area", value: workspace.matter.practiceArea },
              { label: "Assigned attorney", value: workspace.matter.assignedAttorney },
              { label: "Matter type", value: workspace.matter.matterType },
            ]}
          />
          <SummaryGrid
            label="Client summary"
            items={[
              { label: "Client", value: workspace.client.displayName },
              { label: "Organisation", value: workspace.client.organisation },
              { label: "Primary contact", value: workspace.client.primaryContact },
              { label: "Communication", value: workspace.client.communicationDetails },
            ]}
          />

          <LawInformationCard title={`Documents (${workspace.documents.totalCount})`}>
            <LawLinkList
              items={workspace.documents.recent.map((document) => ({
                title: document.title,
                subtitle: document.reference,
                route: document.route,
              }))}
              emptyLabel="No documents linked to this matter."
            />
          </LawInformationCard>

          <LawInformationCard title="Tasks">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Open
                </h4>
                <LawLinkList
                  items={workspace.tasks.open.map((task) => ({
                    title: task.title,
                    subtitle: task.reference,
                    route: task.route,
                  }))}
                  emptyLabel="No open tasks."
                />
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Overdue
                </h4>
                <LawLinkList
                  items={workspace.tasks.overdue.map((task) => ({
                    title: task.title,
                    subtitle: task.dueAt?.slice(0, 10) ?? task.reference,
                    route: task.route,
                  }))}
                  emptyLabel="No overdue tasks."
                />
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Upcoming
                </h4>
                <LawLinkList
                  items={workspace.tasks.upcoming.map((task) => ({
                    title: task.title,
                    subtitle: task.dueAt?.slice(0, 10) ?? task.reference,
                    route: task.route,
                  }))}
                  emptyLabel="No upcoming tasks."
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push(workspace.tasks.createRoute)}
            >
              Quick create task (placeholder route)
            </Button>
          </LawInformationCard>

          <LawInformationCard title="Time">
            <dl className="mb-4 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Total hours
                </dt>
                <dd className="text-lg font-semibold">{workspace.time.totalHours}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Billable hours
                </dt>
                <dd className="text-lg font-semibold">
                  {workspace.time.billableHours}
                </dd>
              </div>
            </dl>
            <LawLinkList
              items={workspace.time.recent.map((entry) => ({
                title: entry.narrative,
                subtitle: `${entry.reference} · ${entry.durationMinutes} min`,
                route: entry.route,
              }))}
              emptyLabel="No time entries for this matter."
            />
          </LawInformationCard>

          <LawInformationCard title="Billing">
            <dl className="mb-4 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Invoice total
                </dt>
                <dd className="text-lg font-semibold">
                  {workspace.billing.invoiceTotal}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Outstanding balance
                </dt>
                <dd className="text-lg font-semibold">
                  {workspace.billing.outstandingBalance}
                </dd>
              </div>
            </dl>
            <LawLinkList
              items={workspace.billing.outstanding.map((invoice) => ({
                title: invoice.reference,
                subtitle: `${invoice.status} · due ${invoice.dueDate.slice(0, 10)} · ${invoice.total}`,
                route: invoice.route,
              }))}
              emptyLabel="No outstanding invoices for this matter."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push(workspace.billing.createRoute)}
              >
                Create invoice
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push(workspace.billing.listRoute)}
              >
                View all invoices
              </Button>
            </div>
          </LawInformationCard>

          <LawInformationCard title="Calendar">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Upcoming
                </h4>
                <LawLinkList
                  items={workspace.calendar.upcoming.map((event) => ({
                    title: event.title,
                    subtitle: event.startsAt.slice(0, 16),
                    route: event.route,
                  }))}
                  emptyLabel="No upcoming events."
                />
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Court appearances
                </h4>
                <LawLinkList
                  items={workspace.calendar.courtAppearances.map((event) => ({
                    title: event.title,
                    subtitle: event.reference,
                    route: event.route,
                  }))}
                  emptyLabel="No court appearances."
                />
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Deadlines
                </h4>
                <LawLinkList
                  items={workspace.calendar.deadlines.map((event) => ({
                    title: event.title,
                    subtitle: event.startsAt.slice(0, 10),
                    route: event.route,
                  }))}
                  emptyLabel="No deadlines."
                />
              </div>
            </div>
          </LawInformationCard>

          <div data-testid="matter-workspace-activity">
            <LawActivityFeed title="Activity timeline" limit={6} />
          </div>

          <div data-testid="matter-workspace-notifications">
            <LawNotificationFeed title="Notifications" limit={5} />
          </div>

          <LawInformationCard title="Knowledge">
            <ul className="list-disc pl-5 text-sm text-[var(--color-muted-foreground)]">
              <li>legal.help.matter.workspace — workspace guidance</li>
              <li>legal.help.matters.detail — matter detail help</li>
              <li>Module help sources registered via Knowledge Framework hydration</li>
            </ul>
          </LawInformationCard>

          <div data-testid="matter-workspace-search">
            <MatterWorkspaceSearchSection
              matterId={matterId}
              matterTitle={workspace.matterTitle}
            />
          </div>
        </div>
      </LawWorkspaceLayout>
    </div>
  );
}
