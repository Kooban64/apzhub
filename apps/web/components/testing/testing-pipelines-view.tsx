"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { formatTestingDate } from "@/lib/testing/format";
import {
  canImportPipelines,
  canViewPipelines,
  type TestingPermissionSource,
} from "@/lib/testing/permissions";
import { testingQueryKeys } from "@/lib/testing/query-keys";
import {
  testingPipelineRepoPath,
  testingPipelineRunPath,
  testingPipelineRunsPath,
  testingPipelineWorkflowsPath,
  testingPipelinesPath,
} from "@/lib/testing/routes";
import {
  getLivePipelineRun,
  getLivePipelineSummary,
  getPipelineLinks,
  getPipelineRepository,
  importPipelineFromProvider,
  listLivePipelineArtifacts,
  listLivePipelineJobs,
  listLivePipelineRuns,
  listLivePipelineSteps,
  listPipelineProviders,
  listPipelineWorkflows,
  listSorPipelines,
} from "@/lib/testing/testing-api";
import { toPipelineUserMessage } from "@/lib/testing/pipeline-errors";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  Panel,
  StatusBadge,
  TestingTable,
} from "./testing-ui";

const DEFAULT_OWNER = "acme";
const DEFAULT_REPO = "portal";

function ForbiddenPipelines() {
  return (
    <PageShell title="Pipelines" description="CI/CD pipeline runs">
      <EmptyState
        title="Pipelines unavailable"
        description="You need pipeline.read permission to view pipeline data."
      />
    </PageShell>
  );
}

export function TestingPipelinesHomeView({
  permissions,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();
  const [owner, setOwner] = useState(DEFAULT_OWNER);
  const [repo, setRepo] = useState(DEFAULT_REPO);

  const pipelinesQuery = useQuery({
    queryKey: testingQueryKeys.pipelines.list(),
    queryFn: ({ signal }) => listSorPipelines({ signal }),
    enabled: canViewPipelines(permissions),
  });

  const providersQuery = useQuery({
    queryKey: testingQueryKeys.pipelines.providers(),
    queryFn: ({ signal }) => listPipelineProviders({ signal }),
    enabled: canViewPipelines(permissions),
  });

  if (!canViewPipelines(permissions)) return <ForbiddenPipelines />;

  if (pipelinesQuery.isLoading || providersQuery.isLoading) {
    return (
      <PageShell title="Pipelines" description="CI/CD pipeline runs">
        <LoadingState label="Loading pipelines…" />
      </PageShell>
    );
  }

  if (pipelinesQuery.isError || providersQuery.isError) {
    return (
      <PageShell title="Pipelines" description="CI/CD pipeline runs">
        <ErrorState
          message={toPipelineUserMessage(pipelinesQuery.error ?? providersQuery.error)}
          onRetry={() => {
            void pipelinesQuery.refetch();
            void providersQuery.refetch();
          }}
        />
      </PageShell>
    );
  }

  const pipelines = pipelinesQuery.data?.items ?? [];
  const providers = providersQuery.data?.items ?? [];

  function onOpenRepo(event: FormEvent) {
    event.preventDefault();
    if (!owner.trim() || !repo.trim()) return;
    router.push(testingPipelineRepoPath(owner.trim(), repo.trim()));
  }

  return (
    <PageShell
      title="Pipelines"
      description="Browse registered pipelines and open a repository for live CI reads."
      breadcrumbs={["Pipelines"]}
    >
      <Panel title="Open repository">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={onOpenRepo}
          aria-label="Open pipeline repository"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-muted-foreground)]">Owner</span>
            <Input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              aria-label="Repository owner"
              data-testid="pipeline-owner-input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-muted-foreground)]">Repository</span>
            <Input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              aria-label="Repository name"
              data-testid="pipeline-repo-input"
            />
          </label>
          <Button type="submit" data-testid="pipeline-open-repo">
            Open repository
          </Button>
        </form>
      </Panel>

      <section className="space-y-3" aria-labelledby="registered-pipelines-heading">
        <h2
          id="registered-pipelines-heading"
          className="text-sm font-semibold text-[var(--color-foreground)]"
        >
          Registered pipelines
        </h2>
        {pipelines.length === 0 ? (
          <EmptyState
            title="No registered pipelines"
            description="Import a provider run to persist pipeline metadata in the platform."
          />
        ) : (
          <TestingTable
            caption="Registered pipelines"
            columns={["Name", "Key", "Provider", "Status", "Repository", "Updated"]}
            rows={pipelines.map((item) => ({
              id: item.id,
              cells: [
                item.name,
                item.key,
                item.providerKind,
                <StatusBadge key="status" status={item.status} />,
                item.repositoryRef ?? "—",
                formatTestingDate(item.updatedAt),
              ],
            }))}
            onRowClick={(id) => {
              const match = pipelines.find((p) => p.id === id);
              if (match?.repositoryRef?.includes("/")) {
                const [o, r] = match.repositoryRef.split("/");
                if (o && r) router.push(testingPipelineRepoPath(o, r));
              }
            }}
          />
        )}
      </section>

      <section className="space-y-3" aria-labelledby="pipeline-providers-heading">
        <h2
          id="pipeline-providers-heading"
          className="text-sm font-semibold text-[var(--color-foreground)]"
        >
          Providers
        </h2>
        {providers.length === 0 ? (
          <EmptyState title="No pipeline providers" />
        ) : (
          <TestingTable
            caption="Pipeline providers"
            columns={["Kind", "Version"]}
            rows={providers.map((item) => ({
              id: item.kind,
              cells: [item.kind, item.version],
            }))}
          />
        )}
      </section>
    </PageShell>
  );
}

export function TestingPipelineRepositoryView({
  owner,
  repo,
  permissions,
}: {
  readonly owner: string;
  readonly repo: string;
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();
  const query = useQuery({
    queryKey: testingQueryKeys.pipelines.repository(owner, repo),
    queryFn: ({ signal }) => getPipelineRepository(owner, repo, { signal }),
    enabled: canViewPipelines(permissions),
  });

  if (!canViewPipelines(permissions)) return <ForbiddenPipelines />;

  if (query.isLoading) {
    return (
      <PageShell title="Repository" breadcrumbs={["Pipelines", `${owner}/${repo}`]}>
        <LoadingState />
      </PageShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageShell title="Repository" breadcrumbs={["Pipelines", `${owner}/${repo}`]}>
        <ErrorState
          message={toPipelineUserMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </PageShell>
    );
  }

  const repository = query.data;

  return (
    <PageShell
      title={repository.fullName}
      description={repository.description ?? "Pipeline repository"}
      breadcrumbs={["Pipelines", repository.fullName]}
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => router.push(testingPipelineWorkflowsPath(owner, repo))}
          >
            Workflows
          </Button>
          <Button onClick={() => router.push(testingPipelineRunsPath(owner, repo))}>
            Runs
          </Button>
        </>
      }
    >
      <dl className="grid gap-3 sm:grid-cols-2" data-testid="pipeline-repository-details">
        <div>
          <dt className="text-xs text-[var(--color-muted-foreground)]">Default branch</dt>
          <dd className="text-sm text-[var(--color-foreground)]">
            {repository.defaultBranch ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted-foreground)]">Visibility</dt>
          <dd className="text-sm text-[var(--color-foreground)]">
            {repository.private ? "Private" : "Public"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-[var(--color-muted-foreground)]">Provider URL</dt>
          <dd className="text-sm text-[var(--color-foreground)]">{repository.htmlUrl}</dd>
        </div>
      </dl>
    </PageShell>
  );
}

export function TestingPipelineWorkflowsView({
  owner,
  repo,
  permissions,
}: {
  readonly owner: string;
  readonly repo: string;
  readonly permissions?: TestingPermissionSource;
}) {
  const query = useQuery({
    queryKey: testingQueryKeys.pipelines.workflows(owner, repo),
    queryFn: ({ signal }) => listPipelineWorkflows(owner, repo, { signal }),
    enabled: canViewPipelines(permissions),
  });

  if (!canViewPipelines(permissions)) return <ForbiddenPipelines />;

  if (query.isLoading) {
    return (
      <PageShell title="Workflows" breadcrumbs={["Pipelines", `${owner}/${repo}`, "Workflows"]}>
        <LoadingState />
      </PageShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageShell title="Workflows" breadcrumbs={["Pipelines", `${owner}/${repo}`, "Workflows"]}>
        <ErrorState
          message={toPipelineUserMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </PageShell>
    );
  }

  const workflows = query.data.items;

  return (
    <PageShell
      title="Workflows"
      description={`Workflow definitions for ${owner}/${repo}`}
      breadcrumbs={["Pipelines", `${owner}/${repo}`, "Workflows"]}
    >
      {workflows.length === 0 ? (
        <EmptyState title="No workflows" />
      ) : (
        <TestingTable
          caption="Workflows"
          columns={["Name", "Path", "State", "Updated"]}
          rows={workflows.map((item) => ({
            id: item.id,
            cells: [
              item.name,
              item.path,
              <StatusBadge key="state" status={item.state} />,
              formatTestingDate(item.updatedAt),
            ],
          }))}
        />
      )}
    </PageShell>
  );
}

export function TestingPipelineRunsView({
  owner,
  repo,
  permissions,
}: {
  readonly owner: string;
  readonly repo: string;
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: testingQueryKeys.pipelines.runs(owner, repo, {
      status: statusFilter || undefined,
      branch: branchFilter || undefined,
    }),
    queryFn: ({ signal }) =>
      listLivePipelineRuns(
        owner,
        repo,
        {
          status: statusFilter || undefined,
          branch: branchFilter || undefined,
        },
        { signal },
      ),
    enabled: canViewPipelines(permissions),
  });

  const filtered = useMemo(() => {
    const items = query.data?.items ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [item.name, item.branch, item.commit, item.actorRef, item.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [query.data?.items, search]);

  if (!canViewPipelines(permissions)) return <ForbiddenPipelines />;

  if (query.isLoading) {
    return (
      <PageShell title="Workflow runs" breadcrumbs={["Pipelines", `${owner}/${repo}`, "Runs"]}>
        <LoadingState />
      </PageShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageShell title="Workflow runs" breadcrumbs={["Pipelines", `${owner}/${repo}`, "Runs"]}>
        <ErrorState
          message={toPipelineUserMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Workflow runs"
      description={`Live runs for ${owner}/${repo}`}
      breadcrumbs={["Pipelines", `${owner}/${repo}`, "Runs"]}
      actions={
        <Button variant="outline" onClick={() => void query.refetch()}>
          Refresh
        </Button>
      }
    >
      <div className="flex flex-wrap gap-3" role="search" aria-label="Filter workflow runs">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search runs"
          aria-label="Search runs"
          data-testid="pipeline-runs-search"
        />
        <Input
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Status"
          aria-label="Filter by status"
        />
        <Input
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          placeholder="Branch"
          aria-label="Filter by branch"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No workflow runs" description="No runs match the current filters." />
      ) : (
        <TestingTable
          caption="Workflow runs"
          columns={["Run", "Status", "Branch", "Commit", "Actor", "Duration", "Started"]}
          rows={filtered.map((item) => ({
            id: item.id,
            cells: [
              item.name || `#${item.runNumber ?? item.id}`,
              <StatusBadge key="status" status={item.status} />,
              item.branch ?? "—",
              item.commit ?? "—",
              item.actorRef ?? "—",
              item.durationLabel,
              formatTestingDate(item.startedAt),
            ],
          }))}
          onRowClick={(id) => router.push(testingPipelineRunPath(owner, repo, id))}
        />
      )}
    </PageShell>
  );
}

export function TestingPipelineRunDetailView({
  owner,
  repo,
  runId,
  permissions,
}: {
  readonly owner: string;
  readonly repo: string;
  readonly runId: string;
  readonly permissions?: TestingPermissionSource;
}) {
  const canImport = canImportPipelines(permissions);

  const runQuery = useQuery({
    queryKey: testingQueryKeys.pipelines.runDetail(owner, repo, runId),
    queryFn: ({ signal }) => getLivePipelineRun(owner, repo, runId, { signal }),
    enabled: canViewPipelines(permissions),
  });
  const jobsQuery = useQuery({
    queryKey: testingQueryKeys.pipelines.jobs(owner, repo, runId),
    queryFn: ({ signal }) => listLivePipelineJobs(owner, repo, runId, { signal }),
    enabled: canViewPipelines(permissions),
  });
  const artifactsQuery = useQuery({
    queryKey: testingQueryKeys.pipelines.artifacts(owner, repo, runId),
    queryFn: ({ signal }) => listLivePipelineArtifacts(owner, repo, runId, { signal }),
    enabled: canViewPipelines(permissions),
  });
  const summaryQuery = useQuery({
    queryKey: testingQueryKeys.pipelines.summary(owner, repo, runId),
    queryFn: ({ signal }) => getLivePipelineSummary(owner, repo, runId, { signal }),
    enabled: canViewPipelines(permissions),
  });
  const linksQuery = useQuery({
    queryKey: testingQueryKeys.pipelines.links(runId),
    queryFn: ({ signal }) => getPipelineLinks(runId, { signal }),
    enabled: canViewPipelines(permissions),
  });

  const firstJobId = jobsQuery.data?.items[0]?.id;
  const stepsQuery = useQuery({
    queryKey: testingQueryKeys.pipelines.steps(owner, repo, runId, firstJobId ?? ""),
    queryFn: ({ signal }) =>
      listLivePipelineSteps(owner, repo, runId, firstJobId!, { signal }),
    enabled: canViewPipelines(permissions) && Boolean(firstJobId),
  });

  if (!canViewPipelines(permissions)) return <ForbiddenPipelines />;

  if (runQuery.isLoading) {
    return (
      <PageShell title="Run details" breadcrumbs={["Pipelines", `${owner}/${repo}`, "Runs", runId]}>
        <LoadingState />
      </PageShell>
    );
  }

  if (runQuery.isError || !runQuery.data) {
    return (
      <PageShell title="Run details" breadcrumbs={["Pipelines", `${owner}/${repo}`, "Runs", runId]}>
        <ErrorState
          message={toPipelineUserMessage(runQuery.error)}
          onRetry={() => void runQuery.refetch()}
        />
      </PageShell>
    );
  }

  const run = runQuery.data;
  const jobs = jobsQuery.data?.items ?? [];
  const steps = stepsQuery.data?.items ?? [];
  const artifacts = artifactsQuery.data?.items ?? [];
  const summary = summaryQuery.data;
  const links = linksQuery.data;

  return (
    <PageShell
      title={run.name || `Run ${run.id}`}
      description={`${owner}/${repo} · ${run.branch ?? "unknown branch"}`}
      breadcrumbs={["Pipelines", `${owner}/${repo}`, "Runs", run.id]}
      actions={
        canImport ? (
          <Button
            variant="outline"
            data-testid="pipeline-refresh-import"
            onClick={() =>
              void importPipelineFromProvider({ owner, repo, runId }).then(() => {
                void linksQuery.refetch();
              })
            }
          >
            Refresh into platform
          </Button>
        ) : null
      }
    >
      <div className="flex flex-wrap items-center gap-3" data-testid="pipeline-run-header">
        <StatusBadge status={run.status} />
        <span className="text-sm text-[var(--color-muted-foreground)]">
          Duration {run.durationLabel}
        </span>
        <span className="text-sm text-[var(--color-muted-foreground)]">
          Commit {run.commit ?? "—"}
        </span>
        <span className="text-sm text-[var(--color-muted-foreground)]">
          Actor {run.actorRef ?? "—"}
        </span>
      </div>

      <section className="space-y-3" aria-labelledby="pipeline-jobs-heading">
        <h2 id="pipeline-jobs-heading" className="text-sm font-semibold">
          Jobs
        </h2>
        {jobs.length === 0 ? (
          <EmptyState title="No jobs" />
        ) : (
          <TestingTable
            caption="Jobs"
            columns={["Job", "Status", "Duration"]}
            rows={jobs.map((job) => ({
              id: job.id,
              cells: [job.name, <StatusBadge key="s" status={job.status} />, job.durationLabel],
            }))}
          />
        )}
      </section>

      <section className="space-y-3" aria-labelledby="pipeline-steps-heading">
        <h2 id="pipeline-steps-heading" className="text-sm font-semibold">
          Steps
        </h2>
        {steps.length === 0 ? (
          <EmptyState title="No steps" description="Select a job with recorded steps." />
        ) : (
          <TestingTable
            caption="Steps"
            columns={["Step", "Status", "Duration"]}
            rows={steps.map((step) => ({
              id: step.id,
              cells: [step.name, <StatusBadge key="s" status={step.status} />, step.durationLabel],
            }))}
          />
        )}
      </section>

      <section
        id="artifacts"
        className="space-y-3"
        aria-labelledby="pipeline-artifacts-heading"
      >
        <h2 id="pipeline-artifacts-heading" className="text-sm font-semibold">
          Artifacts
        </h2>
        {artifacts.length === 0 ? (
          <EmptyState title="No artifacts" />
        ) : (
          <TestingTable
            caption="Artifacts"
            columns={["Name", "Type", "Size", "Created"]}
            rows={artifacts.map((artifact) => ({
              id: artifact.id,
              cells: [
                artifact.name,
                artifact.type ?? "—",
                artifact.sizeLabel,
                formatTestingDate(artifact.createdAt),
              ],
            }))}
          />
        )}
      </section>

      <section id="summary" className="space-y-3" aria-labelledby="pipeline-summary-heading">
        <h2 id="pipeline-summary-heading" className="text-sm font-semibold">
          Pipeline summary
        </h2>
        {!summary ? (
          <EmptyState title="No summary" />
        ) : (
          <Panel title={summary.headline}>
            <div className="flex flex-wrap gap-4 text-sm">
              <StatusBadge status={summary.overallStatus} />
              <span>Passed {summary.passed}</span>
              <span>Failed {summary.failed}</span>
              <span>Skipped {summary.skipped}</span>
              <span>Cancelled {summary.cancelled}</span>
            </div>
          </Panel>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2" aria-label="Linked platform records">
        <Panel title="Evidence">
          {(links?.evidenceIds.length ?? 0) === 0 ? (
            <EmptyState title="No evidence links" />
          ) : (
            <ul className="list-disc pl-5 text-sm">
              {links!.evidenceIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Coverage">
          {(links?.coverageMetricIds.length ?? 0) === 0 ? (
            <EmptyState title="No coverage links" />
          ) : (
            <ul className="list-disc pl-5 text-sm">
              {links!.coverageMetricIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Certification">
          {links?.certificationRecordId ? (
            <p className="text-sm">{links.certificationRecordId}</p>
          ) : (
            <EmptyState title="No certification link" />
          )}
        </Panel>
        <Panel title="Release">
          {links?.releaseId ? (
            <p className="text-sm">{links.releaseId}</p>
          ) : (
            <EmptyState title="No release link" />
          )}
        </Panel>
      </section>
    </PageShell>
  );
}

export function TestingPipelinesView({
  permissions,
  owner,
  repo,
  runId,
  mode = "home",
}: {
  readonly permissions?: TestingPermissionSource;
  readonly owner?: string;
  readonly repo?: string;
  readonly runId?: string;
  readonly mode?: "home" | "repository" | "workflows" | "runs" | "run-detail";
}) {
  if (mode === "repository" && owner && repo) {
    return (
      <TestingPipelineRepositoryView owner={owner} repo={repo} permissions={permissions} />
    );
  }
  if (mode === "workflows" && owner && repo) {
    return (
      <TestingPipelineWorkflowsView owner={owner} repo={repo} permissions={permissions} />
    );
  }
  if (mode === "runs" && owner && repo) {
    return <TestingPipelineRunsView owner={owner} repo={repo} permissions={permissions} />;
  }
  if (mode === "run-detail" && owner && repo && runId) {
    return (
      <TestingPipelineRunDetailView
        owner={owner}
        repo={repo}
        runId={runId}
        permissions={permissions}
      />
    );
  }
  return <TestingPipelinesHomeView permissions={permissions} />;
}

/** Convenience for tests that need a stable home path. */
export const PIPELINES_HOME_PATH = testingPipelinesPath();
