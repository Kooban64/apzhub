"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import { executeTestingCommand } from "@/lib/testing/commands";
import { toTestingUserMessage } from "@/lib/testing/errors";
import { formatBytes, formatTestingDate } from "@/lib/testing/format";
import { FIXTURE_IDS } from "@/lib/testing/mock-client";
import {
  canCreateCase,
  canCreatePlan,
  canCreateSuite,
  type TestingPermissionSource,
} from "@/lib/testing/permissions";
import { testingQueryKeys } from "@/lib/testing/query-keys";
import { testingPlanPath } from "@/lib/testing/routes";
import {
  getPlan,
  listAdminSettings,
  listAutomationRuns,
  listCases,
  listCoverage,
  listDefects,
  listEvidence,
  listPlans,
  listQualitySummaries,
  listReportPlaceholders,
  listRequirements,
  listSuites,
} from "@/lib/testing/testing-api";
import type { TestingListParams } from "@/lib/testing/types";

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

function useSearchParamsState(): [TestingListParams, (search: string) => void] {
  const [search, setSearch] = useState("");
  const params = useMemo<TestingListParams>(
    () => (search.trim() ? { search: search.trim() } : {}),
    [search],
  );
  return [params, setSearch];
}

function ListQueryStates({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyTitle,
  onRetry,
  children,
}: {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: unknown;
  readonly isEmpty: boolean;
  readonly emptyTitle: string;
  readonly onRetry: () => void;
  readonly children: ReactNode;
}) {
  if (isLoading) return <LoadingState />;
  if (isError) {
    return <ErrorState message={toTestingUserMessage(error)} onRetry={onRetry} />;
  }
  if (isEmpty) return <EmptyState title={emptyTitle} />;
  return children;
}

export function TestingRequirementsView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const [params, setSearch] = useSearchParamsState();

  const query = useQuery({
    queryKey: testingQueryKeys.requirements.list(params),
    queryFn: ({ signal }) => listRequirements(params, { signal }),
  });

  return (
    <PageShell
      title="Requirements"
      description="Traceability requirements linked to test planning."
    >
      <FilterBar>
        <Input
          label="Search"
          value={params.search ?? ""}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-requirements-search"
        />
      </FilterBar>
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No requirements found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Requirements"
            columns={["Key", "Title", "Status", "Priority", "Updated"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.key,
                item.title,
                <StatusBadge key="status" status={item.status} />,
                item.priority,
                formatTestingDate(item.updatedAt),
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingPlansView({
  planId,
  permissions,
}: {
  readonly planId?: string;
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [params, setSearch] = useSearchParamsState();
  const [planName, setPlanName] = useState("New test plan");

  const listQuery = useQuery({
    queryKey: testingQueryKeys.plans.list(params),
    queryFn: ({ signal }) => listPlans(params, { signal }),
    enabled: !planId,
  });

  const detailQuery = useQuery({
    queryKey: testingQueryKeys.plans.detail(planId ?? ""),
    queryFn: ({ signal }) => getPlan(planId ?? "", { signal }),
    enabled: Boolean(planId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      executeTestingCommand("create_plan", { name: planName.trim() }, permissions),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: testingQueryKeys.plans.all() });
      void queryClient.invalidateQueries({ queryKey: testingQueryKeys.dashboard() });
    },
  });

  if (planId) {
    if (detailQuery.isLoading) return <LoadingState />;
    if (detailQuery.isError || !detailQuery.data) {
      return (
        <ErrorState
          message={toTestingUserMessage(detailQuery.error)}
          onRetry={() => void detailQuery.refetch()}
        />
      );
    }

    const plan = detailQuery.data;
    return (
      <PageShell
        title={plan.name}
        description={`Plan ${plan.id}`}
        breadcrumbs={["Plans", plan.name]}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(testingPlanPath())}
            data-testid="testing-plans-back"
          >
            Back to plans
          </Button>
        }
      >
        <Panel title="Plan details">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">
                Status
              </dt>
              <dd>
                <StatusBadge status={plan.status} />
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">
                Version
              </dt>
              <dd>{plan.version}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">
                Suites
              </dt>
              <dd>{plan.suiteCount}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">
                Updated
              </dt>
              <dd>{formatTestingDate(plan.updatedAt)}</dd>
            </div>
          </dl>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Test plans"
      description="Organize suites and cases into versioned test plans."
      actions={
        canCreatePlan(permissions) ? (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px]">
              <Input
                label="Plan name"
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                disabled={createMutation.isPending}
                data-testid="testing-plans-create-name"
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={createMutation.isPending || !planName.trim()}
              onClick={() => createMutation.mutate()}
              data-testid="testing-plans-create"
            >
              Create plan
            </Button>
          </div>
        ) : null
      }
    >
      <FilterBar>
        <Input
          label="Search"
          value={params.search ?? ""}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-plans-search"
        />
      </FilterBar>
      {createMutation.isError ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="alert">
          {toTestingUserMessage(createMutation.error)}
        </p>
      ) : null}
      <ListQueryStates
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        error={listQuery.error}
        isEmpty={listQuery.isSuccess && listQuery.data.items.length === 0}
        emptyTitle="No test plans found"
        onRetry={() => void listQuery.refetch()}
      >
        {listQuery.isSuccess ? (
          <TestingTable
            caption="Test plans"
            columns={["Name", "Status", "Version", "Suites", "Updated"]}
            rows={listQuery.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.name,
                <StatusBadge key="status" status={item.status} />,
                item.version,
                String(item.suiteCount),
                formatTestingDate(item.updatedAt),
              ],
            }))}
            onRowClick={(id) => router.push(testingPlanPath(id))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingSuitesView({
  permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const queryClient = useQueryClient();
  const [params, setSearch] = useSearchParamsState();
  const [suiteName, setSuiteName] = useState("New test suite");
  const [planId, setPlanId] = useState<string>(FIXTURE_IDS.plan);

  const query = useQuery({
    queryKey: testingQueryKeys.suites.list(params),
    queryFn: ({ signal }) => listSuites(params, { signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      executeTestingCommand(
        "create_suite",
        { name: suiteName.trim(), planId: planId.trim() },
        permissions,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: testingQueryKeys.suites.all() });
      void queryClient.invalidateQueries({ queryKey: testingQueryKeys.plans.all() });
    },
  });

  return (
    <PageShell
      title="Test suites"
      description="Group related test cases within a plan."
      actions={
        canCreateSuite(permissions) ? (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[180px]">
              <Input
                label="Suite name"
                value={suiteName}
                onChange={(event) => setSuiteName(event.target.value)}
                disabled={createMutation.isPending}
                data-testid="testing-suites-create-name"
              />
            </div>
            <div className="min-w-[180px]">
              <Input
                label="Plan ID"
                value={planId}
                onChange={(event) => setPlanId(event.target.value)}
                disabled={createMutation.isPending}
                data-testid="testing-suites-create-plan-id"
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={createMutation.isPending || !suiteName.trim() || !planId.trim()}
              onClick={() => createMutation.mutate()}
              data-testid="testing-suites-create"
            >
              Create suite
            </Button>
          </div>
        ) : null
      }
    >
      <FilterBar>
        <Input
          label="Search"
          value={params.search ?? ""}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-suites-search"
        />
      </FilterBar>
      {createMutation.isError ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="alert">
          {toTestingUserMessage(createMutation.error)}
        </p>
      ) : null}
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No test suites found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Test suites"
            columns={["Name", "Plan", "Cases", "Status", "Updated"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.name,
                item.planName,
                String(item.caseCount),
                <StatusBadge key="status" status={item.status} />,
                formatTestingDate(item.updatedAt),
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingCasesView({
  permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const queryClient = useQueryClient();
  const [params, setSearch] = useSearchParamsState();
  const [caseTitle, setCaseTitle] = useState("New test case");
  const [suiteId, setSuiteId] = useState<string>(FIXTURE_IDS.suite);

  const query = useQuery({
    queryKey: testingQueryKeys.cases.list(params),
    queryFn: ({ signal }) => listCases(params, { signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      executeTestingCommand(
        "create_case",
        { title: caseTitle.trim(), suiteId: suiteId.trim() },
        permissions,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: testingQueryKeys.cases.all() });
      void queryClient.invalidateQueries({ queryKey: testingQueryKeys.suites.all() });
    },
  });

  return (
    <PageShell
      title="Test cases"
      description="Executable test cases linked to suites and requirements."
      actions={
        canCreateCase(permissions) ? (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[180px]">
              <Input
                label="Case title"
                value={caseTitle}
                onChange={(event) => setCaseTitle(event.target.value)}
                disabled={createMutation.isPending}
                data-testid="testing-cases-create-title"
              />
            </div>
            <div className="min-w-[180px]">
              <Input
                label="Suite ID"
                value={suiteId}
                onChange={(event) => setSuiteId(event.target.value)}
                disabled={createMutation.isPending}
                data-testid="testing-cases-create-suite-id"
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={
                createMutation.isPending || !caseTitle.trim() || !suiteId.trim()
              }
              onClick={() => createMutation.mutate()}
              data-testid="testing-cases-create"
            >
              Create case
            </Button>
          </div>
        ) : null
      }
    >
      <FilterBar>
        <Input
          label="Search"
          value={params.search ?? ""}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-cases-search"
        />
      </FilterBar>
      {createMutation.isError ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="alert">
          {toTestingUserMessage(createMutation.error)}
        </p>
      ) : null}
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No test cases found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Test cases"
            columns={["Key", "Title", "Suite", "Priority", "Status", "Updated"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.key,
                item.title,
                item.suiteName,
                item.priority,
                <StatusBadge key="status" status={item.status} />,
                formatTestingDate(item.updatedAt),
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingAutomationView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const [params, setSearch] = useSearchParamsState();

  const query = useQuery({
    queryKey: testingQueryKeys.automation.list(params),
    queryFn: ({ signal }) => listAutomationRuns(params, { signal }),
  });

  return (
    <PageShell
      title="Automation"
      description="Imported automation run results from connected adapters."
    >
      <FilterBar>
        <Input
          label="Search"
          value={params.search ?? ""}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-automation-search"
        />
      </FilterBar>
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No automation runs found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Automation runs"
            columns={["Adapter", "Status", "Passed", "Failed", "Skipped", "Imported"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.adapter,
                <StatusBadge key="status" status={item.status} />,
                String(item.passed),
                String(item.failed),
                String(item.skipped),
                formatTestingDate(item.importedAt),
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingEvidenceView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const [params, setSearch] = useSearchParamsState();

  const query = useQuery({
    queryKey: testingQueryKeys.evidence.list(params),
    queryFn: ({ signal }) => listEvidence(params, { signal }),
  });

  return (
    <PageShell
      title="Evidence"
      description="Registered evidence metadata linked to executions."
    >
      <FilterBar>
        <Input
          label="Search"
          value={params.search ?? ""}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-evidence-search"
        />
      </FilterBar>
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No evidence records found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Evidence"
            columns={["Title", "Kind", "Content type", "Size", "Status", "Created"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.title,
                item.kind,
                item.contentType,
                formatBytes(item.sizeBytes),
                <StatusBadge key="status" status={item.status} />,
                formatTestingDate(item.createdAt),
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingCoverageView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const query = useQuery({
    queryKey: testingQueryKeys.coverage.list(),
    queryFn: ({ signal }) => listCoverage({ signal }),
  });

  return (
    <PageShell
      title="Coverage"
      description="Coverage dimensions provided by the testing platform."
    >
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No coverage summaries found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Coverage summaries"
            columns={["Dimension", "Covered", "Total", "Percent", "Status"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.dimension,
                String(item.covered),
                String(item.total),
                item.percentLabel,
                <StatusBadge key="status" status={item.status} />,
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingDefectsView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const [params, setSearch] = useSearchParamsState();

  const query = useQuery({
    queryKey: testingQueryKeys.defects.list(params),
    queryFn: ({ signal }) => listDefects(params, { signal }),
  });

  return (
    <PageShell
      title="Defects"
      description="Defect links surfaced from execution and quality signals."
    >
      <FilterBar>
        <Input
          label="Search"
          value={params.search ?? ""}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-defects-search"
        />
      </FilterBar>
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No defects found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Defects"
            columns={[
              "Title",
              "Severity",
              "Status",
              "Linked case",
              "Source",
              "Updated",
            ]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.title,
                item.severity,
                <StatusBadge key="status" status={item.status} />,
                item.linkedCaseKey ?? "—",
                item.sourceLabel,
                formatTestingDate(item.updatedAt),
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingQualityView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const query = useQuery({
    queryKey: testingQueryKeys.quality.list(),
    queryFn: ({ signal }) => listQualitySummaries({ signal }),
  });

  return (
    <PageShell
      title="Quality"
      description="Quality posture summaries for releases and milestones."
    >
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No quality summaries found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Quality summaries"
            columns={["Title", "Status", "Summary", "Updated"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.title,
                <StatusBadge key="status" status={item.status} />,
                item.summary,
                formatTestingDate(item.updatedAt),
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingReportsView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const query = useQuery({
    queryKey: testingQueryKeys.reports.list(),
    queryFn: ({ signal }) => listReportPlaceholders({ signal }),
  });

  return (
    <PageShell
      title="Reports"
      description="Testing report templates from platform reporting."
    >
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No report templates found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Report templates"
            columns={["Title", "Description", "Status"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.title,
                item.description,
                <StatusBadge key="status" status={item.status} />,
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}

export function TestingAdministrationView({
  permissions: _permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const query = useQuery({
    queryKey: testingQueryKeys.admin.list(),
    queryFn: ({ signal }) => listAdminSettings({ signal }),
  });

  return (
    <PageShell
      title="Administration"
      description="Read-only testing platform settings."
    >
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No admin settings found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <TestingTable
            caption="Administration settings"
            columns={["Setting", "Value"]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [item.label, item.value],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </PageShell>
  );
}
