"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LawInformationCard,
  LawPageHeader,
  LawQuickActionsCard,
  LawSearchBar,
  LawStatisticsCard,
  LawWorkspaceLayout,
  lawUxTokens,
} from "../ux";
import {
  LawActivityFeed,
  LawNotificationFeed,
} from "../ux/law-activity-notification-feed";
import { LawLinkList } from "../ux/law-link-list";
import { composeExecutiveDashboardSnapshot } from "../../lib/dashboard";

export interface ExecutiveDashboardPageProps {
  readonly userName?: string;
}

/** Executive landing page after login — firm-wide composition (LAW-013-01). */
export function ExecutiveDashboardPage({ userName }: ExecutiveDashboardPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const snapshot = useMemo(
    () => composeExecutiveDashboardSnapshot(userName),
    [userName],
  );

  return (
    <div data-testid="executive-dashboard-page">
      <LawWorkspaceLayout
        header={
          <LawPageHeader
            eyebrow="Executive Dashboard"
            title="Firm overview"
            subtitle={snapshot.welcomeMessage}
          />
        }
      >
        <section
          className={`${lawUxTokens.surface} ${lawUxTokens.accentBorder} border-l-4 p-5`}
          aria-label="Welcome"
          data-testid="executive-dashboard-welcome"
        >
          <p className={lawUxTokens.label}>Welcome</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--color-foreground)]">
            {snapshot.welcomeMessage}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Last refreshed {new Date(snapshot.refreshedAt).toLocaleTimeString()}.
          </p>
        </section>

        <section aria-label="Global search" className={lawUxTokens.section}>
          <LawSearchBar
            value={searchQuery}
            placeholder="Search clients, matters, documents, tasks, time, and calendar…"
            onChange={setSearchQuery}
            onSubmit={(query) => {
              const trimmed = query.trim();
              if (trimmed) {
                router.push(
                  `${snapshot.globalSearchRoute}?q=${encodeURIComponent(trimmed)}`,
                );
              } else {
                router.push(snapshot.globalSearchRoute);
              }
            }}
            ariaLabel="Global search"
            trailing={
              <Button type="submit" size="sm">
                Search
              </Button>
            }
          />
        </section>

        <section
          aria-label="Key metrics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          data-testid="executive-dashboard-metrics"
        >
          <LawStatisticsCard
            label="Open matters"
            value={String(snapshot.metrics.openMatters)}
          />
          <LawStatisticsCard
            label="Active clients"
            value={String(snapshot.metrics.activeClients)}
          />
          <LawStatisticsCard
            label="Open tasks"
            value={String(snapshot.metrics.openTasks)}
            hint={
              snapshot.metrics.overdueTasks > 0
                ? `${snapshot.metrics.overdueTasks} overdue`
                : "None overdue"
            }
          />
          <LawStatisticsCard
            label="Today's events"
            value={String(snapshot.metrics.todayEvents)}
          />
          <LawStatisticsCard
            label="Unbilled time"
            value={snapshot.metrics.unbilledHours}
            hint="Billable hours"
          />
          <LawStatisticsCard
            label="Outstanding invoices"
            value={String(snapshot.metrics.outstandingInvoices)}
            hint={snapshot.metrics.outstandingBalance}
          />
        </section>

        <LawQuickActionsCard
          title="Quick actions"
          actions={snapshot.quickActions.map((action) => (
            <Button
              key={action.route}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(action.route)}
            >
              {action.label}
            </Button>
          ))}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <LawInformationCard title="Today's calendar">
            <LawLinkList
              items={snapshot.todayCalendar}
              emptyLabel="No events scheduled for today."
              testId="executive-dashboard-calendar"
            />
          </LawInformationCard>

          <LawInformationCard title="Open matters">
            <LawLinkList
              items={snapshot.openMatters}
              emptyLabel="No open matters."
              testId="executive-dashboard-matters"
            />
          </LawInformationCard>

          <LawInformationCard title="Recent clients">
            <LawLinkList
              items={snapshot.recentClients}
              emptyLabel="No clients on file."
              testId="executive-dashboard-clients"
            />
          </LawInformationCard>

          <LawInformationCard title="Recent documents">
            <LawLinkList
              items={snapshot.recentDocuments}
              emptyLabel="No documents on file."
              testId="executive-dashboard-documents"
            />
          </LawInformationCard>

          <LawInformationCard title="Outstanding tasks">
            <LawLinkList
              items={snapshot.outstandingTasks}
              emptyLabel="No open tasks."
              testId="executive-dashboard-tasks"
            />
          </LawInformationCard>

          <LawInformationCard title="Unbilled time">
            <LawLinkList
              items={snapshot.unbilledTime}
              emptyLabel="No unbilled time entries."
              testId="executive-dashboard-time"
            />
          </LawInformationCard>

          <LawInformationCard title="Outstanding invoices">
            <LawLinkList
              items={snapshot.outstandingInvoices}
              emptyLabel="No outstanding invoices."
              testId="executive-dashboard-invoices"
            />
          </LawInformationCard>

          <LawNotificationFeed />
          <LawActivityFeed />
        </div>
      </LawWorkspaceLayout>
    </div>
  );
}
