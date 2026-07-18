"use client";

import { useQuery } from "@tanstack/react-query";

import { toTestingUserMessage } from "@/lib/testing/errors";
import { formatTestingDate } from "@/lib/testing/format";
import type { TestingPermissionSource } from "@/lib/testing/permissions";
import { testingQueryKeys } from "@/lib/testing/query-keys";
import { listReleaseReadiness } from "@/lib/testing/testing-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  Panel,
  StatusBadge,
  TestingTable,
} from "./testing-ui";

export function TestingReleaseReadinessView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const query = useQuery({
    queryKey: testingQueryKeys.release.list(),
    queryFn: ({ signal }) => listReleaseReadiness({ signal }),
  });

  if (query.isLoading) {
    return (
      <PageShell title="Release readiness" description="Release readiness dimensions">
        <LoadingState />
      </PageShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageShell title="Release readiness" description="Release readiness dimensions">
        <ErrorState
          message={toTestingUserMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </PageShell>
    );
  }

  if (query.data.items.length === 0) {
    return (
      <PageShell title="Release readiness" description="Release readiness dimensions">
        <EmptyState title="No release readiness records found" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Release readiness"
      description="Release readiness dimensions provided by the platform."
    >
      <div className="flex flex-col gap-6" data-testid="testing-release-readiness">
        {query.data.items.map((release) => (
          <Panel key={release.id} title={`Release ${release.releaseLabel}`}>
            <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Overall status
                </dt>
                <dd>
                  <StatusBadge status={release.overallStatus} />
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">
                  Updated
                </dt>
                <dd>{formatTestingDate(release.updatedAt)}</dd>
              </div>
            </dl>

            {release.dimensions.length === 0 ? (
              <EmptyState title="No readiness dimensions" />
            ) : (
              <TestingTable
                caption={`Release ${release.releaseLabel} dimensions`}
                columns={["Dimension", "Status", "Detail"]}
                rows={release.dimensions.map((dimension, index) => ({
                  id: `${release.id}-${index}`,
                  cells: [
                    dimension.name,
                    <StatusBadge key="status" status={dimension.status} />,
                    dimension.detail,
                  ],
                }))}
              />
            )}
          </Panel>
        ))}
      </div>
    </PageShell>
  );
}
