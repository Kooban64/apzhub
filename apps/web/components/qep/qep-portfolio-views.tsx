"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { QEP_EARLY_CHECK_ROUTES } from "@/lib/qep/early-check-routes";
import { QEP_PORTFOLIO_ROUTES } from "@/lib/qep/portfolio-routes";
import { QEP_QUALITY_JOURNEY_ROUTES } from "@/lib/qep/quality-journey-routes";
import { QEP_SCM_ROUTES } from "@/lib/qep/routes";
import {
  formatSourceBindingsSummary,
  ProjectSourceFields,
  useProjectSourceForm,
} from "@/components/commercial/project-source-fields";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

type QualityProject = {
  id: string;
  name: string;
  description?: string;
  repositoryIds: string[];
  status: string;
  createdAt: string;
  sourceBindings?: readonly {
    providerId: string;
    externalRef: string;
    mode: string;
  }[];
};

type TokenHealth = {
  configured: boolean;
  source: "server_secrets" | "none";
};

type Insight = {
  project: QualityProject;
  tokenHealth: TokenHealth;
  repositories: Array<{
    repositoryId: string;
    fullName?: string;
    healthOk?: boolean;
    healthDetail?: string;
  }>;
  recentChangeCount: number;
  recentChanges: Array<{
    changeEventId: string;
    kind: string;
    summary: string;
    occurredAt: string;
  }>;
  recentDispatchCount: number;
  latestDispatches: Array<{
    dispatchId: string;
    changeEventId: string;
    pack?: string;
    status: string;
    detail?: string;
  }>;
  defects: {
    available: boolean;
    openCount: number;
    highOrCriticalCount: number;
  };
  latestCertification?: {
    changeEventId: string;
    evaluationId: string;
    readiness?: string;
    score?: number;
    humanDecision?: string;
  };
};

export function QepPortfolioRouterView() {
  return <PortfolioHomeView />;
}

function PortfolioHomeView() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState(searchParams?.get("projectId") ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRepoIds, setSelectedRepoIds] = useState<string[]>([]);
  const [attachRepoId, setAttachRepoId] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const {
    form: sourceForm,
    setForm: setSourceForm,
    payload: sourcePayload,
    reset: resetSourceForm,
  } = useProjectSourceForm();

  const listQuery = useQuery({
    queryKey: ["qep-portfolio", "projects"],
    queryFn: () =>
      fetchJson<{ projects: QualityProject[]; tokenHealth: TokenHealth }>(
        "/api/v1/qep/portfolio/projects",
      ),
  });

  const reposQuery = useQuery({
    queryKey: ["qep-scm", "repositories", "for-portfolio"],
    queryFn: () =>
      fetchJson<{
        repositories: Array<{ repositoryId: string; fullName: string }>;
      }>("/api/v1/qep/scm/repositories"),
  });

  const insightQuery = useQuery({
    queryKey: ["qep-portfolio", "insight", projectId.trim()],
    enabled: projectId.trim().length > 4,
    queryFn: () =>
      fetchJson<Insight>(
        `/api/v1/qep/portfolio/projects/${encodeURIComponent(projectId.trim())}`,
      ),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ project: QualityProject }>("/api/v1/qep/portfolio/projects", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || undefined,
          repositoryIds: selectedRepoIds,
          source: sourcePayload,
        }),
      }),
    onSuccess: (data) => {
      setActionMessage(`Created ${data.project.name}`);
      setName("");
      setDescription("");
      setSelectedRepoIds([]);
      resetSourceForm();
      setProjectId(data.project.id);
      void queryClient.invalidateQueries({
        queryKey: ["qep-portfolio", "projects"],
      });
    },
    onError: (error) => setActionMessage((error as Error).message),
  });

  const {
    form: attachSourceForm,
    setForm: setAttachSourceForm,
    payload: attachSourcePayload,
    reset: resetAttachSourceForm,
  } = useProjectSourceForm();

  const attachMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetchJson<{ project: QualityProject }>(
        `/api/v1/qep/portfolio/projects/${encodeURIComponent(projectId.trim())}/repositories`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
    onSuccess: () => {
      setActionMessage("Source / repository updated");
      setAttachRepoId("");
      resetAttachSourceForm();
      void queryClient.invalidateQueries({
        queryKey: ["qep-portfolio", "insight", projectId.trim()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["qep-portfolio", "projects"],
      });
    },
    onError: (error) => setActionMessage((error as Error).message),
  });

  const projects = listQuery.data?.projects ?? [];
  const selectedProject = projects.find((p) => p.id === projectId);
  const tokenHealth = listQuery.data?.tokenHealth ?? insightQuery.data?.tokenHealth;
  const repos = reposQuery.data?.repositories ?? [];
  const insight = insightQuery.data;

  function toggleRepo(id: string) {
    setSelectedRepoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <QepPageShell
      title="Portfolio and Projects"
      description="Flagship F14 — PM Quality Hub. Register a quality project, attach GitHub repos (SCM), see QEP insight. PAT stays server-side — never paste tokens here."
    >
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={QEP_SCM_ROUTES.home}>Source Control</Link>
        <Link href={QEP_EARLY_CHECK_ROUTES.home}>Early Check</Link>
        <Link href={QEP_QUALITY_JOURNEY_ROUTES.home}>Quality Journey</Link>
      </div>
      <QepPanel title="SCM token health">
        {tokenHealth ? (
          <div
            className="flex flex-wrap items-center gap-2 text-sm"
            data-testid="qep-portfolio-token-health"
          >
            <QepStatusBadge
              status={tokenHealth.configured ? "configured" : "missing"}
            />
            <span>
              GitHub PAT:{" "}
              {tokenHealth.configured
                ? "configured (server secrets)"
                : "missing — ops must set APZHUB_SCM_GITHUB_TOKEN / .secrets/git"}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              source={tokenHealth.source}
            </span>
          </div>
        ) : (
          <QepLoadingState label="Checking token health…" />
        )}
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          Register repos in{" "}
          <Link href={QEP_SCM_ROUTES.home} className="underline">
            Source Control
          </Link>
          , then attach them here. No browser PAT entry.
        </p>
      </QepPanel>

      {actionMessage ? (
        <p
          className="mt-2 text-sm text-[var(--color-muted-foreground)]"
          data-testid="qep-portfolio-action-message"
        >
          {actionMessage}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <QepPanel title="Create quality project">
          <label className="mb-2 block text-sm">
            Name
            <input
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="qep-portfolio-create-name"
            />
          </label>
          <label className="mb-2 block text-sm">
            Description
            <textarea
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="mb-2">
            <p className="text-sm font-medium">Attach repos (optional)</p>
            {repos.length === 0 ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                No SCM repositories yet — register one in Source Control first, or bind
                a GitHub ref below.
              </p>
            ) : (
              <ul className="mt-1 max-h-40 space-y-1 overflow-auto text-sm">
                {repos.map((repo) => (
                  <li key={repo.repositoryId}>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRepoIds.includes(repo.repositoryId)}
                        onChange={() => toggleRepo(repo.repositoryId)}
                      />
                      <span className="font-mono text-xs">{repo.fullName}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ProjectSourceFields
            value={sourceForm}
            onChange={setSourceForm}
            productLabel="APZQEP"
            testIdPrefix="qep-portfolio-source"
          />
          <button
            type="button"
            data-testid="qep-portfolio-create"
            className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
            disabled={
              !name.trim() ||
              createMutation.isPending ||
              (sourceForm.enabled && !sourceForm.externalRef.trim())
            }
            onClick={() => {
              setActionMessage(null);
              createMutation.mutate();
            }}
          >
            {createMutation.isPending ? "Creating…" : "Create project"}
          </button>
        </QepPanel>

        <QepPanel title="Quality projects">
          {listQuery.isFetching ? (
            <QepLoadingState label="Loading projects…" />
          ) : listQuery.isError ? (
            <QepErrorState message={(listQuery.error as Error).message} />
          ) : projects.length === 0 ? (
            <QepEmptyState title="No quality projects yet." />
          ) : (
            <ul className="space-y-2" data-testid="qep-portfolio-project-list">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    className="w-full rounded-md border border-[var(--color-border)] p-2 text-left text-sm hover:bg-[var(--color-muted)]"
                    onClick={() => setProjectId(project.id)}
                    data-testid={`qep-portfolio-select-${project.id}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <QepStatusBadge status={project.status} />
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted-foreground)]">
                      {project.id} · {project.repositoryIds.length} repo(s)
                      {formatSourceBindingsSummary(project.sourceBindings)
                        ? ` · ${formatSourceBindingsSummary(project.sourceBindings)}`
                        : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </QepPanel>
      </div>

      {projectId.trim().length > 4 ? (
        <div className="mt-4 space-y-4" data-testid="qep-portfolio-insight">
          {insightQuery.isFetching && !insight ? (
            <QepLoadingState label="Loading project insight…" />
          ) : insightQuery.isError ? (
            <QepErrorState message={(insightQuery.error as Error).message} />
          ) : insight ? (
            <>
              <QepPanel title={`Insight — ${insight.project.name}`}>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {insight.project.description || "No description"} · advisory QEP view
                  · never auto-certified
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <span>
                    Changes: <strong>{insight.recentChangeCount}</strong>
                  </span>
                  <span>
                    Dispatches: <strong>{insight.recentDispatchCount}</strong>
                  </span>
                  <span>
                    Defects:{" "}
                    <strong>
                      {insight.defects.available
                        ? `${insight.defects.openCount} open (${insight.defects.highOrCriticalCount} H/C)`
                        : "n/a"}
                    </strong>
                  </span>
                  {insight.latestCertification ? (
                    <span>
                      Cert:{" "}
                      <strong>
                        {insight.latestCertification.humanDecision ??
                          insight.latestCertification.readiness}{" "}
                        {insight.latestCertification.score != null
                          ? `${insight.latestCertification.score}%`
                          : ""}
                      </strong>
                    </span>
                  ) : (
                    <span>Cert: none yet</span>
                  )}
                </div>
              </QepPanel>

              <QepPanel title="Linked repositories">
                {insight.repositories.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    No SCM repos linked yet.
                  </p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {insight.repositories.map((repo) => (
                      <li key={repo.repositoryId} className="flex flex-wrap gap-2">
                        <QepStatusBadge
                          status={repo.healthOk === false ? "unhealthy" : "repo"}
                        />
                        <Link
                          href={QEP_SCM_ROUTES.repository(repo.repositoryId)}
                          className="font-mono text-xs text-[var(--color-primary)] underline"
                          data-testid="qep-portfolio-repo-scm-link"
                        >
                          {repo.fullName ?? repo.repositoryId}
                        </Link>
                        {repo.healthDetail ? (
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            {repo.healthDetail}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                {formatSourceBindingsSummary(selectedProject?.sourceBindings) ? (
                  <p
                    className="mt-2 font-mono text-xs text-[var(--color-muted-foreground)]"
                    data-testid="qep-portfolio-source-summary"
                  >
                    Bound:{" "}
                    {formatSourceBindingsSummary(selectedProject?.sourceBindings)}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <label className="block text-sm">
                    Attach repositoryId
                    <select
                      className="mt-1 block rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                      value={attachRepoId}
                      onChange={(e) => setAttachRepoId(e.target.value)}
                      data-testid="qep-portfolio-attach-select"
                    >
                      <option value="">Select…</option>
                      {repos.map((repo) => (
                        <option key={repo.repositoryId} value={repo.repositoryId}>
                          {repo.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    data-testid="qep-portfolio-attach"
                    className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
                    disabled={!attachRepoId || attachMutation.isPending}
                    onClick={() => {
                      setActionMessage(null);
                      attachMutation.mutate({ repositoryIds: [attachRepoId] });
                    }}
                  >
                    Attach repo
                  </button>
                </div>
                <div className="mt-3">
                  <ProjectSourceFields
                    value={attachSourceForm}
                    onChange={setAttachSourceForm}
                    productLabel="APZQEP"
                    testIdPrefix="qep-portfolio-attach-source"
                  />
                  <button
                    type="button"
                    data-testid="qep-portfolio-bind-source"
                    className="mt-2 inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)] disabled:opacity-50"
                    disabled={!attachSourcePayload || attachMutation.isPending}
                    onClick={() => {
                      setActionMessage(null);
                      attachMutation.mutate({
                        source: attachSourcePayload,
                      });
                    }}
                  >
                    Bind source to project
                  </button>
                </div>
              </QepPanel>

              <QepPanel title="Recent changes">
                {insight.recentChanges.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    No changes for linked repos yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {insight.recentChanges.slice(0, 8).map((change) => (
                      <li
                        key={change.changeEventId}
                        className="rounded-md border border-[var(--color-border)] p-2 text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <QepStatusBadge status={change.kind} />
                          <span>{change.summary}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <Link
                            href={QEP_EARLY_CHECK_ROUTES.byChange(change.changeEventId)}
                          >
                            Early Check
                          </Link>
                          <Link
                            href={QEP_QUALITY_JOURNEY_ROUTES.byChange(
                              change.changeEventId,
                            )}
                          >
                            Journey
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </QepPanel>

              {insight.latestDispatches.length > 0 ? (
                <QepPanel title="Recent dispatches">
                  <ul className="space-y-1 text-sm">
                    {insight.latestDispatches.slice(0, 8).map((row) => (
                      <li key={row.dispatchId} className="flex flex-wrap gap-2">
                        <QepStatusBadge status={row.status} />
                        {row.pack ? <QepStatusBadge status={row.pack} /> : null}
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          {row.detail ?? row.changeEventId}
                        </span>
                      </li>
                    ))}
                  </ul>
                </QepPanel>
              ) : null}

              <p className="text-xs text-[var(--color-muted-foreground)]">
                Deep link:{" "}
                <code>{QEP_PORTFOLIO_ROUTES.byProject(insight.project.id)}</code>
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </QepPageShell>
  );
}
