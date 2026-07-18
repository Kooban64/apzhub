"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toTestingUserMessage } from "@/lib/testing/errors";
import { formatTestingDate } from "@/lib/testing/format";
import type { TestingPermissionSource } from "@/lib/testing/permissions";
import { testingQueryKeys } from "@/lib/testing/query-keys";
import { testingCertificationPath, testingExecutionPath } from "@/lib/testing/routes";
import { getDashboard } from "@/lib/testing/testing-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  TestingStatCard,
  TestingTable,
} from "./testing-ui";

export function TestingDashboardView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();

  const query = useQuery({
    queryKey: testingQueryKeys.dashboard(),
    queryFn: ({ signal }) => getDashboard({ signal }),
  });

  if (query.isLoading) {
    return (
      <PageShell title="Dashboard" description="Testing workbench overview">
        <LoadingState />
      </PageShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageShell title="Dashboard" description="Testing workbench overview">
        <ErrorState
          message={toTestingUserMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </PageShell>
    );
  }

  const dashboard = query.data;

  return (
    <PageShell title="Dashboard" description={dashboard.headline}>
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="testing-dashboard-stats"
      >
        {dashboard.cards.map((card) => (
          <TestingStatCard
            key={card.id}
            label={card.label}
            value={card.value}
            tone={card.tone}
          />
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          Recent certifications
        </h2>
        {dashboard.recentCertifications.length === 0 ? (
          <EmptyState title="No recent certifications" />
        ) : (
          <TestingTable
            caption="Recent certifications"
            columns={["Name", "State", "Recommendation", "Updated"]}
            rows={dashboard.recentCertifications.map((item) => ({
              id: item.id,
              cells: [
                item.name,
                <StatusBadge key="state" status={item.state} />,
                <StatusBadge key="rec" status={item.recommendation} />,
                formatTestingDate(item.updatedAt),
              ],
            }))}
            onRowClick={(id) => router.push(testingCertificationPath(id))}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          Recent executions
        </h2>
        {dashboard.recentExecutions.length === 0 ? (
          <EmptyState title="No recent executions" />
        ) : (
          <TestingTable
            caption="Recent executions"
            columns={["Case", "Status", "Assignee", "Progress", "Updated"]}
            rows={dashboard.recentExecutions.map((item) => ({
              id: item.id,
              cells: [
                `${item.caseKey} — ${item.caseTitle}`,
                <StatusBadge key="status" status={item.status} />,
                item.assignee,
                item.progressLabel,
                formatTestingDate(item.updatedAt),
              ],
            }))}
            onRowClick={(id) => router.push(testingExecutionPath(id))}
          />
        )}
      </section>
    </PageShell>
  );
}
