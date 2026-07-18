"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { toTestingUserMessage } from "@/lib/testing/errors";
import { formatTestingDate } from "@/lib/testing/format";
import type { TestingPermissionSource } from "@/lib/testing/permissions";
import { testingQueryKeys } from "@/lib/testing/query-keys";
import { testingExecutionPath } from "@/lib/testing/routes";
import { getExecution, listExecutions } from "@/lib/testing/testing-api";
import type { TestingListParams } from "@/lib/testing/types";

import { TestingCommandsPanel } from "./testing-commands-panel";
import {
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingState,
  PageShell,
  Panel,
  StatusBadge,
  TestingTable,
} from "./testing-ui";

export function TestingExecutionView({
  executionId,
  permissions,
}: {
  readonly executionId?: string;
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const params = useMemo<TestingListParams>(
    () => (search.trim() ? { search: search.trim() } : {}),
    [search],
  );

  const listQuery = useQuery({
    queryKey: testingQueryKeys.executions.list(params),
    queryFn: ({ signal }) => listExecutions(params, { signal }),
    enabled: !executionId,
  });

  const detailQuery = useQuery({
    queryKey: testingQueryKeys.executions.detail(executionId ?? ""),
    queryFn: ({ signal }) => getExecution(executionId ?? "", { signal }),
    enabled: Boolean(executionId),
  });

  function invalidateExecutions() {
    void queryClient.invalidateQueries({ queryKey: testingQueryKeys.executions.all() });
    void queryClient.invalidateQueries({ queryKey: testingQueryKeys.dashboard() });
    void queryClient.invalidateQueries({ queryKey: testingQueryKeys.evidence.all() });
    if (executionId) {
      void queryClient.invalidateQueries({
        queryKey: testingQueryKeys.executions.detail(executionId),
      });
    }
  }

  if (executionId) {
    if (detailQuery.isLoading) return <LoadingState />;
    if (detailQuery.isError || !detailQuery.data) {
      return (
        <ErrorState
          message={toTestingUserMessage(detailQuery.error)}
          onRetry={() => void detailQuery.refetch()}
        />
      );
    }

    const execution = detailQuery.data;

    return (
      <PageShell
        title={`${execution.caseKey} — ${execution.caseTitle}`}
        description={`Execution ${execution.id}`}
        breadcrumbs={["Executions", execution.caseKey]}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(testingExecutionPath())}
            data-testid="testing-executions-back"
          >
            Back to executions
          </Button>
        }
      >
        <Panel title="Execution details">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">
                Status
              </dt>
              <dd>
                <StatusBadge status={execution.status} />
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">
                Assignee
              </dt>
              <dd>{execution.assignee}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">
                Progress
              </dt>
              <dd>{execution.progressLabel}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">
                Updated
              </dt>
              <dd>{formatTestingDate(execution.updatedAt)}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Commands">
          <TestingCommandsPanel
            permissions={permissions}
            variant="execution"
            context={{ executionId: execution.id }}
            onSuccess={invalidateExecutions}
          />
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Executions"
      description="Manual and automated test execution records."
    >
      <FilterBar>
        <Input
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-executions-search"
        />
      </FilterBar>

      <Panel title="Start new execution">
        <TestingCommandsPanel
          permissions={permissions}
          variant="execution"
          context={{}}
          onSuccess={invalidateExecutions}
        />
      </Panel>

      {listQuery.isLoading ? <LoadingState /> : null}
      {listQuery.isError ? (
        <ErrorState
          message={toTestingUserMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
        />
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length === 0 ? (
        <EmptyState title="No executions found" />
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length > 0 ? (
        <TestingTable
          caption="Executions"
          columns={["Case", "Status", "Assignee", "Progress", "Updated"]}
          rows={listQuery.data.items.map((item) => ({
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
      ) : null}
    </PageShell>
  );
}
