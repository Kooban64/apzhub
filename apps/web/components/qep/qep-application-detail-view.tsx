"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import type {
  EnvironmentCategory,
  QepApplicationEnvironment,
  QepApplicationExecutionTarget,
} from "@apzhub/qep-applications";
import { QEP_APPLICATIONS_BASE_PATH } from "@apzhub/qep-applications/presentation";

import { listDefects } from "@/lib/qep/qep-defects-api";
import { listEvidence } from "@/lib/qep/qep-evidence-api";
import { listRequirements } from "@/lib/qep/qep-api";
import {
  attachApplicationRepository,
  createApplicationEnvironment,
  createApplicationExecutionTarget,
  getApplication,
  listApplicationEnvironments,
  listApplicationExecutionTargets,
  listApplicationRepositories,
  type ApplicationRepositoryRow,
} from "@/lib/qep/qep-applications-api";
import { useWorkbenchInspector } from "@/lib/workbench/workbench-inspector";
import { QepErrorState, QepLoadingState } from "./qep-ui";

type TabId =
  "overview" | "repositories" | "environments" | "targets" | "integrations" | "people";

const TABS: readonly { readonly id: TabId; readonly label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "repositories", label: "Repositories" },
  { id: "environments", label: "Environments" },
  { id: "targets", label: "Execution Targets" },
  { id: "integrations", label: "Integrations" },
  { id: "people", label: "People & Access" },
];

function setupLabel(value: "configured" | "not_configured"): string {
  return value === "configured" ? "Configured" : "Not configured";
}

function CountFact({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border border-[var(--color-border)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export function QepApplicationDetailView({
  applicationId,
}: {
  readonly applicationId: string;
}) {
  const inspector = useWorkbenchInspector();
  const client = useQueryClient();
  const [tab, setTab] = useState<TabId>("overview");
  const detailQ = useQuery({
    queryKey: ["qep-application", applicationId],
    queryFn: () => getApplication(applicationId),
  });
  const reposQ = useQuery({
    queryKey: ["qep-application", applicationId, "repos"],
    queryFn: () => listApplicationRepositories(applicationId),
    enabled: tab === "repositories" || tab === "overview",
  });
  const envsQ = useQuery({
    queryKey: ["qep-application", applicationId, "envs"],
    queryFn: () => listApplicationEnvironments(applicationId),
    enabled: tab === "environments" || tab === "targets" || tab === "overview",
  });
  const targetsQ = useQuery({
    queryKey: ["qep-application", applicationId, "targets"],
    queryFn: () => listApplicationExecutionTargets(applicationId),
    enabled: tab === "targets" || tab === "overview",
  });
  const qualityQ = useQuery({
    queryKey: [
      "qep-application",
      applicationId,
      "quality-context",
      detailQ.data?.application.projectRefs,
    ],
    queryFn: async () => {
      const refs =
        detailQ.data?.application.projectRefs &&
        detailQ.data.application.projectRefs.length > 0
          ? detailQ.data.application.projectRefs
          : [applicationId];
      const counts = {
        requirements: "Unavailable" as string,
        testCases: "Unavailable" as string,
        openDefects: "Unavailable" as string,
        evidence: "Unavailable" as string,
      };
      try {
        const listed = await Promise.all(
          refs.map((projectId) => listRequirements({ projectId })),
        );
        counts.requirements = String(
          listed.reduce((sum, row) => sum + row.items.length, 0),
        );
      } catch {
        /* keep Unavailable */
      }
      try {
        const listed = await Promise.all(
          refs.map((projectId) => listDefects({ projectId })),
        );
        counts.openDefects = String(
          listed.reduce(
            (sum, row) =>
              sum +
              row.items.filter(
                (item) => item.status !== "closed" && item.status !== "archived",
              ).length,
            0,
          ),
        );
      } catch {
        /* keep Unavailable */
      }
      try {
        const listed = await Promise.all(
          refs.map((projectId) => listEvidence({ projectId })),
        );
        counts.evidence = String(
          listed.reduce((sum, row) => sum + row.items.length, 0),
        );
      } catch {
        /* keep Unavailable */
      }
      return counts;
    },
    enabled: tab === "overview" && Boolean(detailQ.data),
  });

  const scmQ = useQuery({
    queryKey: ["qep-scm", "repositories", "connect"],
    queryFn: async () => {
      const response = await fetch("/api/v1/qep/scm/repositories", {
        cache: "no-store",
      });
      const body = (await response.json()) as {
        data?: {
          repositories?: readonly {
            readonly repositoryId: string;
            readonly fullName: string;
          }[];
        };
      };
      return body.data?.repositories ?? [];
    },
    enabled: tab === "repositories",
  });

  const attach = useMutation({
    mutationFn: (scmRepositoryId: string) =>
      attachApplicationRepository(applicationId, scmRepositoryId),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["qep-application", applicationId] }),
  });

  if (detailQ.isLoading) return <QepLoadingState label="Loading application…" />;
  if (detailQ.isError || !detailQ.data) {
    return (
      <QepErrorState
        message={(detailQ.error as Error | undefined)?.message ?? "Not found"}
      />
    );
  }

  const { application, setup } = detailQ.data;

  function selectEnvironment(row: QepApplicationEnvironment) {
    inspector.setSelection({
      id: row.id,
      title: row.name,
      content: (
        <div className="space-y-3 text-xs" data-testid="qep-environment-inspector">
          <h2 className="text-sm font-semibold">{row.name}</h2>
          <p className="capitalize">{row.category}</p>
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd className="mt-0.5 capitalize">{row.status}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Target</dt>
              <dd className="mt-0.5">Not configured</dd>
            </div>
          </dl>
          {row.baseUrl ? <p>{row.baseUrl}</p> : null}
          {row.description ? <p>{row.description}</p> : null}
        </div>
      ),
    });
  }

  function selectRepository(row: ApplicationRepositoryRow) {
    inspector.setSelection({
      id: row.id,
      title: row.fullName ?? row.scmRepositoryId,
      content: (
        <div className="space-y-3 text-xs" data-testid="qep-repository-inspector">
          <h2 className="text-sm font-semibold">
            {row.fullName ?? row.scmRepositoryId}
          </h2>
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Default branch</dt>
              <dd className="mt-0.5">{row.defaultBranch ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Source access</dt>
              <dd className="mt-0.5 capitalize">{row.sourceAccess}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">State</dt>
              <dd className="mt-0.5 capitalize">{row.state}</dd>
            </div>
          </dl>
          <p className="text-[var(--color-muted-foreground)]">
            Application repository association does not grant Source access.
          </p>
        </div>
      ),
    });
  }

  function selectTarget(row: QepApplicationExecutionTarget) {
    inspector.setSelection({
      id: row.id,
      title: row.name,
      content: (
        <div className="space-y-3 text-xs" data-testid="qep-execution-target-inspector">
          <h2 className="text-sm font-semibold">{row.name}</h2>
          <p className="capitalize">{String(row.targetType).replaceAll("_", " ")}</p>
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd className="mt-0.5 capitalize">{row.status.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Host</dt>
              <dd className="mt-0.5">{String(row.config.host ?? "—")}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Credential</dt>
              <dd className="mt-0.5">{String(row.config.credentialRef ?? "—")}</dd>
            </div>
          </dl>
        </div>
      ),
    });
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-application-detail"
    >
      <header>
        <Link
          href={QEP_APPLICATIONS_BASE_PATH}
          className="text-xs text-[var(--color-muted-foreground)]"
        >
          Applications
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          {application.name}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Application · <span className="capitalize">{application.status}</span>
        </p>
      </header>

      <div className="flex flex-wrap gap-4" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`border-b-2 px-0.5 pb-1.5 text-sm ${
              tab === item.id
                ? "border-[var(--color-primary)] font-medium"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-6 text-xs" data-testid="qep-application-overview">
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Application
            </h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                <dd className="mt-0.5 text-sm font-medium">{application.name}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Key</dt>
                <dd className="mt-0.5 text-sm font-medium">{application.key}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[var(--color-muted-foreground)]">Description</dt>
                <dd className="mt-0.5">{application.description ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
                <dd className="mt-0.5">
                  {application.ownerDisplayName || "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                <dd className="mt-0.5 capitalize">{application.status}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Quality context
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              <CountFact
                label="Requirements"
                value={qualityQ.data?.requirements ?? "Unavailable"}
              />
              <CountFact
                label="Test Cases"
                value={qualityQ.data?.testCases ?? "Unavailable"}
              />
              <CountFact
                label="Open Defects"
                value={qualityQ.data?.openDefects ?? "Unavailable"}
              />
              <CountFact
                label="Evidence"
                value={qualityQ.data?.evidence ?? "Unavailable"}
              />
            </div>
          </section>
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Setup
            </h2>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex justify-between border-b border-[var(--color-border)] py-2">
                <dt>Repositories</dt>
                <dd>{setupLabel(setup.repositories)}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--color-border)] py-2">
                <dt>Environments</dt>
                <dd>{setupLabel(setup.environments)}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--color-border)] py-2">
                <dt>Execution Targets</dt>
                <dd>{setupLabel(setup.executionTargets)}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--color-border)] py-2">
                <dt>Integrations</dt>
                <dd>{setupLabel(setup.integrations)}</dd>
              </div>
            </dl>
          </section>
        </div>
      ) : null}

      {tab === "repositories" ? (
        <RepositoriesPane
          items={reposQ.data?.items ?? []}
          scm={scmQ.data ?? []}
          onSelect={selectRepository}
          onAttach={(id) => attach.mutate(id)}
          attaching={attach.isPending}
          error={attach.error ? (attach.error as Error).message : undefined}
        />
      ) : null}

      {tab === "environments" ? (
        <EnvironmentsPane
          applicationId={applicationId}
          items={envsQ.data?.items ?? []}
          onSelect={selectEnvironment}
        />
      ) : null}

      {tab === "targets" ? (
        <TargetsPane
          applicationId={applicationId}
          items={targetsQ.data?.items ?? []}
          environments={envsQ.data?.items ?? []}
          onSelect={selectTarget}
        />
      ) : null}

      {tab === "integrations" ? (
        <IntegrationsPane configured={setup.integrations === "configured"} />
      ) : null}

      {tab === "people" ? (
        <div className="space-y-2 text-xs" data-testid="qep-application-people">
          <p>
            Application access uses organisation IAM and the scope{" "}
            <code>qep.application:{application.id}</code>.
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            This surface does not provision users or invent QEP roles. Source write is
            not implied by Application access.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function RepositoriesPane({
  items,
  scm,
  onSelect,
  onAttach,
  attaching,
  error,
}: {
  readonly items: readonly ApplicationRepositoryRow[];
  readonly scm: readonly { readonly repositoryId: string; readonly fullName: string }[];
  readonly onSelect: (row: ApplicationRepositoryRow) => void;
  readonly onAttach: (id: string) => void;
  readonly attaching: boolean;
  readonly error?: string;
}) {
  const [selected, setSelected] = useState("");
  const available = scm.filter(
    (row) => !items.some((item) => item.scmRepositoryId === row.repositoryId),
  );
  return (
    <div className="space-y-3" data-testid="qep-application-repositories">
      <div className="flex flex-wrap gap-2">
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
        >
          <option value="">Connect repository</option>
          {available.map((row) => (
            <option key={row.repositoryId} value={row.repositoryId}>
              {row.fullName}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selected || attaching}
          onClick={() => onAttach(selected)}
          className="h-9 rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)] disabled:opacity-50"
        >
          + Connect Repository
        </button>
      </div>
      {error ? (
        <p className="text-xs text-[var(--color-destructive)]">{error}</p>
      ) : null}
      <div className="overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="min-w-full text-xs">
          <thead className="text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-3 py-2">Repository</th>
              <th className="px-3 py-2">Default branch</th>
              <th className="px-3 py-2">Source access</th>
              <th className="px-3 py-2">State</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8">
                  No repositories are associated with this application.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40"
                  onClick={() => onSelect(row)}
                >
                  <td className="px-3 py-2.5">{row.fullName ?? row.scmRepositoryId}</td>
                  <td className="px-3 py-2.5">{row.defaultBranch ?? "—"}</td>
                  <td className="px-3 py-2.5 capitalize">{row.sourceAccess}</td>
                  <td className="px-3 py-2.5 capitalize">{row.state}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnvironmentsPane({
  applicationId,
  items,
  onSelect,
}: {
  readonly applicationId: string;
  readonly items: readonly QepApplicationEnvironment[];
  readonly onSelect: (row: QepApplicationEnvironment) => void;
}) {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EnvironmentCategory>("test");
  const create = useMutation({
    mutationFn: () => createApplicationEnvironment(applicationId, { name, category }),
    onSuccess: () => {
      setName("");
      void client.invalidateQueries({
        queryKey: ["qep-application", applicationId, "envs"],
      });
    },
  });
  return (
    <div className="space-y-3" data-testid="qep-application-environments">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Environment name"
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as EnvironmentCategory)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
        >
          <option value="development">Development</option>
          <option value="test">Test / QA</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
          <option value="custom">Custom</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
        >
          + Environment
        </button>
      </form>
      <div className="overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="min-w-full text-xs">
          <thead className="text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-3 py-2">Environment</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8">
                  No environments are configured for this application.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40"
                  onClick={() => onSelect(row)}
                  data-testid={`qep-environment-row-${row.id}`}
                >
                  <td className="px-3 py-2.5">{row.name}</td>
                  <td className="px-3 py-2.5 capitalize">{row.category}</td>
                  <td className="px-3 py-2.5">Not configured</td>
                  <td className="px-3 py-2.5 capitalize">{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TargetsPane({
  applicationId,
  items,
  environments,
  onSelect,
}: {
  readonly applicationId: string;
  readonly items: readonly QepApplicationExecutionTarget[];
  readonly environments: readonly QepApplicationEnvironment[];
  readonly onSelect: (row: QepApplicationExecutionTarget) => void;
}) {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [targetType, setTargetType] = useState("remote_host");
  const [environmentId, setEnvironmentId] = useState("");
  const [host, setHost] = useState("");
  const [credentialRef, setCredentialRef] = useState("");
  const create = useMutation({
    mutationFn: () =>
      createApplicationExecutionTarget(applicationId, {
        name,
        targetType,
        environmentId: environmentId || undefined,
        status: host || credentialRef ? "configured" : "not_configured",
        config:
          targetType === "remote_host"
            ? {
                ...(host ? { host } : {}),
                ...(credentialRef ? { credentialRef } : {}),
                port: 22,
              }
            : {},
      }),
    onSuccess: () => {
      setName("");
      setHost("");
      setCredentialRef("");
      void client.invalidateQueries({
        queryKey: ["qep-application", applicationId, "targets"],
      });
    },
  });
  return (
    <div className="space-y-3" data-testid="qep-application-targets">
      <form
        className="grid grid-cols-1 gap-2 lg:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Target name"
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
        />
        <select
          value={targetType}
          onChange={(event) => setTargetType(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
        >
          <option value="ci_pipeline">CI / Pipeline</option>
          <option value="managed_runner">Managed Runner</option>
          <option value="remote_host">Remote Host</option>
        </select>
        <select
          value={environmentId}
          onChange={(event) => setEnvironmentId(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
        >
          <option value="">Environment</option>
          {environments.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
        {targetType === "remote_host" ? (
          <>
            <input
              value={host}
              onChange={(event) => setHost(event.target.value)}
              placeholder="Host reference"
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
            />
            <input
              value={credentialRef}
              onChange={(event) => setCredentialRef(event.target.value)}
              placeholder="Credential reference (no secrets)"
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
              data-testid="qep-remote-host-credential-ref"
            />
          </>
        ) : null}
        <button
          type="submit"
          className="h-9 rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
        >
          + Execution Target
        </button>
        {create.isError ? (
          <p className="text-[var(--color-destructive)]">
            {(create.error as Error).message}
          </p>
        ) : null}
      </form>
      <div className="overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="min-w-full text-xs">
          <thead className="text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Environment</th>
              <th className="px-3 py-2">State</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8">
                  No execution targets are configured.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40"
                  onClick={() => onSelect(row)}
                  data-testid={`qep-execution-target-row-${row.id}`}
                >
                  <td className="px-3 py-2.5">{row.name}</td>
                  <td className="px-3 py-2.5 capitalize">
                    {String(row.targetType).replaceAll("_", " ")}
                  </td>
                  <td className="px-3 py-2.5">
                    {environments.find((env) => env.id === row.environmentId)?.name ??
                      "—"}
                  </td>
                  <td className="px-3 py-2.5 capitalize">
                    {row.status.replaceAll("_", " ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegrationsPane({ configured }: { readonly configured: boolean }) {
  return (
    <div className="space-y-2 text-xs" data-testid="qep-application-integrations">
      <p>SCM: {configured ? "Configured" : "Not configured"}</p>
      <p className="text-[var(--color-muted-foreground)]">
        Integration health is not displayed unless a live provider check exists.
        Provider implementation names are reserved for diagnostic surfaces.
      </p>
    </div>
  );
}
