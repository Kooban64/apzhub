"use client";

import { useQuery } from "@tanstack/react-query";

import { isSupportApiError } from "@/lib/support/errors";
import { formatSupportDate } from "@/lib/support/format";
import { supportQueryKeys } from "@/lib/support/query-keys";
import { getSupportAnalytics } from "@/lib/support/support-api";

import {
  ErrorState,
  LoadingState,
  PageShell,
  SupportStatCard,
} from "./support-ui";

export function SupportAnalyticsView() {
  const query = useQuery({
    queryKey: supportQueryKeys.analytics(),
    queryFn: ({ signal }) => getSupportAnalytics({ signal }),
  });

  if (query.isLoading) {
    return (
      <PageShell title="Analytics" description="Support intelligence snapshot">
        <LoadingState />
      </PageShell>
    );
  }
  if (query.isError || !query.data) {
    return (
      <PageShell title="Analytics" description="Support intelligence snapshot">
        <ErrorState
          message={
            isSupportApiError(query.error)
              ? query.error.message
              : "Failed to load Support analytics."
          }
          onRetry={() => void query.refetch()}
        />
      </PageShell>
    );
  }

  const snapshot = query.data.data;

  return (
    <PageShell
      title="Analytics"
      description={`Support intelligence snapshot · captured ${formatSupportDate(snapshot.capturedAt)}`}
    >
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="support-analytics"
      >
        <SupportStatCard label="Total requests" value={snapshot.totalTickets} />
        <SupportStatCard label="Open" value={snapshot.openTickets} />
        <SupportStatCard label="Pending" value={snapshot.pendingTickets} />
        <SupportStatCard label="Closed" value={snapshot.closedTickets} />
        <SupportStatCard label="New" value={snapshot.newTickets} />
        <SupportStatCard label="Unassigned" value={snapshot.unassignedTickets} />
        <SupportStatCard
          label="Overdue"
          value={snapshot.overdueTickets}
          hint="Heuristic estimate — not an SLA measurement"
        />
        {snapshot.articleCount !== undefined ? (
          <SupportStatCard label="Articles" value={snapshot.articleCount} />
        ) : null}
        {snapshot.averageFirstResponseMinutes !== undefined ? (
          <SupportStatCard
            label="Avg first response (min)"
            value={snapshot.averageFirstResponseMinutes}
          />
        ) : null}
      </div>

      <DistributionSection title="By priority" buckets={snapshot.byPriority} />
      <DistributionSection title="By state" buckets={snapshot.byState} />
      <DistributionSection title="By organization" buckets={snapshot.byOrganization} />
      <DistributionSection title="By group" buckets={snapshot.byGroup} />
      <DistributionSection title="By owner" buckets={snapshot.byOwner} />
    </PageShell>
  );
}

function DistributionSection({
  title,
  buckets,
}: {
  readonly title: string;
  readonly buckets: readonly { readonly key: string; readonly label?: string; readonly count: number }[];
}) {
  if (buckets.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {buckets.map((bucket) => (
          <li
            key={bucket.key}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <span className="font-medium">{bucket.label ?? bucket.key}</span>
            <span className="ml-2 text-[var(--color-muted-foreground)]">{bucket.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
