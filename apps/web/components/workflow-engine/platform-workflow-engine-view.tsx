"use client";

import { Button } from "@apzhub/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import {
  getEngineCapabilities,
  getEngineCompatibility,
  getEngineDiagnostics,
  getEngineHealth,
  getEngineTemplate,
  getEngineWorkflow,
  listEngineProjects,
  listEngineTags,
  listEngineTemplates,
  listEngineUsers,
  listEngineWorkflows,
  validateEngineConnection,
} from "@/lib/workflows/engine-api";
import {
  toWorkflowEngineUserMessage,
  WorkflowEngineClientError,
} from "@/lib/workflows/engine-errors";
import { workflowEngineQueryKeys } from "@/lib/workflows/engine-query-keys";
import type { WorkflowEngineSection } from "@/lib/workflows/routes";
import { WORKFLOW_ENGINE_API_BASE } from "@/lib/workflows/routes";

import { EngineDefinitionViewer } from "./engine-definition-viewer";

function PageShell({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="workflow-engine-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Workflow Engine
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="workflow-engine-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  forbidden,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly forbidden?: boolean;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid={forbidden ? "workflow-engine-forbidden" : "workflow-engine-error"}
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {forbidden ? "Access denied" : "Unable to load Workflow Engine"}
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      {onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function StatusCard({
  label,
  value,
  testId,
  emphasize,
}: {
  readonly label: string;
  readonly value: string;
  readonly testId?: string;
  readonly emphasize?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border border-[var(--color-border)] px-4 py-3",
        emphasize ? "border-[var(--color-foreground)] bg-[var(--color-muted)]/40" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function DataTable({
  columns,
  rows,
  caption,
  onRowClick,
  selectedId,
  testIdPrefix = "workflow-engine",
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly caption?: string;
  readonly onRowClick?: (id: string) => void;
  readonly selectedId?: string | null;
  readonly testIdPrefix?: string;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid={`${testIdPrefix}-table`}
    >
      <table className="min-w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-3 py-2 font-medium text-[var(--color-foreground)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={[
                "border-b border-[var(--color-border)]",
                onRowClick ? "cursor-pointer hover:bg-[var(--color-muted)]/20" : "",
                selectedId === row.id ? "bg-[var(--color-muted)]/30" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={onRowClick ? () => onRowClick(row.id) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row.id);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              aria-selected={selectedId === row.id ? true : undefined}
              data-testid={`${testIdPrefix}-row-${row.id}`}
            >
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.id}-${index}`}
                  className="px-3 py-2 text-[var(--color-foreground)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function copyText(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  throw new Error("Clipboard is unavailable.");
}

function isForbidden(error: unknown): boolean {
  return (
    error instanceof WorkflowEngineClientError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

const SECTION_META: Record<
  WorkflowEngineSection,
  { readonly title: string; readonly description: string }
> = {
  overview: {
    title: "Overview",
    description: "Read-only engine inventory and health — no mutations.",
  },
  workflows: {
    title: "Workflows",
    description: "Engine workflow metadata and definition viewer.",
  },
  templates: {
    title: "Templates",
    description: "Engine template catalogue — view only.",
  },
  projects: {
    title: "Projects",
    description: "Engine project metadata.",
  },
  users: {
    title: "Users",
    description: "Engine user assignments (metadata).",
  },
  tags: {
    title: "Tags",
    description: "Engine tags and usage hints.",
  },
  capabilities: {
    title: "Capabilities",
    description: "Supported and unsupported engine operations.",
  },
  health: {
    title: "Health",
    description: "Platform and engine health signals.",
  },
  diagnostics: {
    title: "Diagnostics",
    description: "Latency, readiness, and support status.",
  },
  compatibility: {
    title: "Compatibility",
    description: "Supported capabilities and known limitations.",
  },
};

export function PlatformWorkflowEngineView({
  section = "overview",
  canValidateConnection = true,
  canViewCapabilities = true,
  canViewDiagnostics = true,
  canViewHealth = true,
}: {
  readonly section?: WorkflowEngineSection;
  /** Server remains authoritative; UI may hide validate when false. */
  readonly canValidateConnection?: boolean;
  readonly canViewCapabilities?: boolean;
  readonly canViewDiagnostics?: boolean;
  readonly canViewHealth?: boolean;
}) {
  const queryClient = useQueryClient();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [apiMetadataOpen, setApiMetadataOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const workflowsQuery = useQuery({
    queryKey: workflowEngineQueryKeys.workflows.list({ limit: 100 }),
    queryFn: ({ signal }) => listEngineWorkflows({ limit: 100 }, { signal }),
  });

  const templatesQuery = useQuery({
    queryKey: workflowEngineQueryKeys.templates.list(),
    queryFn: ({ signal }) => listEngineTemplates({ signal }),
  });

  const projectsQuery = useQuery({
    queryKey: workflowEngineQueryKeys.projects(),
    queryFn: ({ signal }) => listEngineProjects({ signal }),
  });

  const usersQuery = useQuery({
    queryKey: workflowEngineQueryKeys.users(),
    queryFn: ({ signal }) => listEngineUsers({ signal }),
  });

  const tagsQuery = useQuery({
    queryKey: workflowEngineQueryKeys.tags(),
    queryFn: ({ signal }) => listEngineTags({ signal }),
  });

  const capabilitiesQuery = useQuery({
    queryKey: workflowEngineQueryKeys.capabilities(),
    queryFn: ({ signal }) => getEngineCapabilities({ signal }),
    enabled: canViewCapabilities,
  });

  const healthQuery = useQuery({
    queryKey: workflowEngineQueryKeys.health(),
    queryFn: ({ signal }) => getEngineHealth({ signal }),
    enabled: canViewHealth,
  });

  const diagnosticsQuery = useQuery({
    queryKey: workflowEngineQueryKeys.diagnostics(),
    queryFn: ({ signal }) => getEngineDiagnostics({ signal }),
    enabled: canViewDiagnostics,
  });

  const compatibilityQuery = useQuery({
    queryKey: workflowEngineQueryKeys.compatibility(),
    queryFn: ({ signal }) => getEngineCompatibility({ signal }),
    enabled: canViewCapabilities,
  });

  const workflows = workflowsQuery.data?.items ?? [];
  const selectedId = selectedWorkflowId ?? workflows[0]?.id ?? null;

  const detailQuery = useQuery({
    queryKey: workflowEngineQueryKeys.workflow(selectedId ?? ""),
    queryFn: ({ signal }) => getEngineWorkflow(selectedId!, { signal }),
    enabled: Boolean(selectedId) && showDetails,
  });

  const templates = templatesQuery.data?.items ?? [];
  const templateId = selectedTemplateId ?? templates[0]?.id ?? null;

  const templateDetailQuery = useQuery({
    queryKey: workflowEngineQueryKeys.template(templateId ?? ""),
    queryFn: ({ signal }) => getEngineTemplate(templateId!, { signal }),
    enabled: Boolean(templateId) && section === "templates",
  });

  const overviewStats = useMemo(() => {
    const active = workflows.filter((item) => item.active).length;
    return {
      total: workflows.length,
      active,
      inactive: workflows.length - active,
      templates: templates.length,
      projects: projectsQuery.data?.items.length ?? 0,
      users: usersQuery.data?.items.length ?? 0,
      tags: tagsQuery.data?.items.length ?? 0,
    };
  }, [
    workflows,
    templates.length,
    projectsQuery.data?.items.length,
    usersQuery.data?.items.length,
    tagsQuery.data?.items.length,
  ]);

  async function invalidateEngineCaches() {
    await queryClient.invalidateQueries({
      queryKey: workflowEngineQueryKeys.all,
    });
  }

  async function refreshAll() {
    setActionError(null);
    setStatusMessage("Refreshed.");
    await invalidateEngineCaches();
  }

  async function copySelectedId() {
    if (!selectedId) {
      setActionError("Select a workflow first.");
      return;
    }
    try {
      await copyText(selectedId);
      setStatusMessage(`Copied workflow ID ${selectedId}`);
      setActionError(null);
    } catch (error) {
      setActionError(toWorkflowEngineUserMessage(error));
    }
  }

  async function runValidateConnection() {
    if (!canValidateConnection) {
      setActionError("Validate Connection is not available for this session.");
      return;
    }
    try {
      const result = await validateEngineConnection();
      setStatusMessage(
        result.ok
          ? result.message || "Connection validated."
          : result.message || "Connection validation failed.",
      );
      setActionError(result.ok ? null : result.message);
    } catch (error) {
      setActionError(toWorkflowEngineUserMessage(error));
    }
  }

  const commands = (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Workflow Engine commands"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void refreshAll()}
        data-testid="workflow-engine-refresh"
      >
        Refresh
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => {
          setShowDetails(true);
          setStatusMessage(
            selectedId
              ? `Viewing details for ${selectedId}`
              : "Select a workflow first.",
          );
          setActionError(null);
        }}
        data-testid="workflow-engine-view-details"
      >
        View Details
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => void copySelectedId()}
        data-testid="workflow-engine-copy-id"
      >
        Copy ID
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setApiMetadataOpen(true);
          setStatusMessage("Opened API metadata.");
          setActionError(null);
        }}
        data-testid="workflow-engine-open-api-metadata"
      >
        Open API Metadata
      </Button>
      {canValidateConnection ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void runValidateConnection()}
          data-testid="workflow-engine-validate"
        >
          Validate Connection
        </Button>
      ) : null}
    </div>
  );

  const statusRegion = (
    <div
      className="flex flex-col gap-1"
      role="status"
      aria-live="polite"
      data-testid="workflow-engine-status"
    >
      {statusMessage ? (
        <p className="text-sm text-[var(--color-foreground)]">{statusMessage}</p>
      ) : null}
      {actionError ? (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );

  const primaryLoading =
    workflowsQuery.isLoading &&
    !workflowsQuery.data &&
    (section === "overview" ||
      section === "workflows" ||
      section === "templates" ||
      section === "projects" ||
      section === "users" ||
      section === "tags");

  if (primaryLoading) {
    return (
      <PageShell title={SECTION_META[section].title} actions={commands}>
        <p
          data-testid="workflow-engine-loading"
          className="text-sm text-[var(--color-muted-foreground)]"
        >
          Loading Workflow Engine…
        </p>
      </PageShell>
    );
  }

  if (workflowsQuery.isError && (section === "overview" || section === "workflows")) {
    const err = workflowsQuery.error;
    return (
      <PageShell title={SECTION_META[section].title} actions={commands}>
        <ErrorState
          message={toWorkflowEngineUserMessage(err)}
          forbidden={isForbidden(err)}
          onRetry={() => void workflowsQuery.refetch()}
        />
      </PageShell>
    );
  }

  const workflowDetailPanel =
    selectedId && showDetails && detailQuery.data ? (
      <div
        className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4"
        data-testid="workflow-engine-detail-panel"
      >
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          {detailQuery.data.name}
        </h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">ID</dt>
            <dd className="text-[var(--color-foreground)]">{detailQuery.data.id}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Active</dt>
            <dd className="text-[var(--color-foreground)]">
              {detailQuery.data.active ? "yes" : "no"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Nodes</dt>
            <dd className="text-[var(--color-foreground)]">
              {detailQuery.data.nodeCount}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Connections</dt>
            <dd className="text-[var(--color-foreground)]">
              {detailQuery.data.connectionCount}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Tags</dt>
            <dd className="text-[var(--color-foreground)]">
              {detailQuery.data.tagNames.join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Version</dt>
            <dd className="text-[var(--color-foreground)]">
              {detailQuery.data.versionHint ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Project</dt>
            <dd className="text-[var(--color-muted-foreground)]">
              Not returned by engine metadata API
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
            <dd className="text-[var(--color-muted-foreground)]">
              Not returned by engine metadata API
            </dd>
          </div>
        </dl>
        <EngineDefinitionViewer workflow={detailQuery.data} />
      </div>
    ) : null;

  let body: ReactNode = null;

  if (section === "overview") {
    body = (
      <div className="flex flex-col gap-4">
        <StatusCard
          label="Mode"
          value="READ-ONLY ENGINE"
          testId="card-readonly-engine"
          emphasize
        />
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="workflow-engine-overview-cards"
        >
          <StatusCard
            label="Total Workflows"
            value={String(overviewStats.total)}
            testId="card-total-workflows"
          />
          <StatusCard
            label="Active Workflows"
            value={String(overviewStats.active)}
            testId="card-active-workflows"
          />
          <StatusCard
            label="Inactive Workflows"
            value={String(overviewStats.inactive)}
            testId="card-inactive-workflows"
          />
          <StatusCard
            label="Templates"
            value={String(overviewStats.templates)}
            testId="card-templates"
          />
          <StatusCard
            label="Projects"
            value={String(overviewStats.projects)}
            testId="card-projects"
          />
          <StatusCard
            label="Users"
            value={String(overviewStats.users)}
            testId="card-users"
          />
          <StatusCard
            label="Tags"
            value={String(overviewStats.tags)}
            testId="card-tags"
          />
          <StatusCard
            label="Platform Health"
            value={
              canViewHealth
                ? (healthQuery.data?.sdkStatus ?? healthQuery.data?.level ?? "—")
                : "hidden"
            }
            testId="card-platform-health"
          />
          <StatusCard
            label="Engine Health"
            value={canViewHealth ? (healthQuery.data?.level ?? "—") : "hidden"}
            testId="card-engine-health"
          />
          <StatusCard
            label="Compatibility"
            value={
              canViewCapabilities
                ? (compatibilityQuery.data?.compatibilityStatus ?? "—")
                : "hidden"
            }
            testId="card-compatibility"
          />
          <StatusCard
            label="HTTP Status"
            value={workflowsQuery.isSuccess ? "ok" : "pending"}
            testId="card-http-status"
          />
        </div>
      </div>
    );
  } else if (section === "workflows") {
    body = (
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-3">
          {workflows.length === 0 ? (
            <EmptyState
              title="No engine workflows"
              description="The engine returned an empty workflow list."
            />
          ) : (
            <DataTable
              caption="Engine workflows"
              columns={["Name", "Active", "Nodes", "Tags", "Updated"]}
              selectedId={selectedId}
              onRowClick={(id) => {
                setSelectedWorkflowId(id);
                setShowDetails(true);
              }}
              rows={workflows.map((item) => ({
                id: item.id,
                cells: [
                  item.name,
                  item.active ? "active" : "inactive",
                  String(item.nodeCount),
                  item.tagNames.join(", ") || "—",
                  item.updatedAt ?? "—",
                ],
              }))}
            />
          )}
        </div>
        {workflowDetailPanel}
      </div>
    );
  } else if (section === "templates") {
    body = (
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6">
        {templatesQuery.isError ? (
          <ErrorState
            message={toWorkflowEngineUserMessage(templatesQuery.error)}
            forbidden={isForbidden(templatesQuery.error)}
            onRetry={() => void templatesQuery.refetch()}
          />
        ) : templates.length === 0 ? (
          <EmptyState title="No templates" description="No engine templates." />
        ) : (
          <DataTable
            caption="Engine templates"
            columns={["Name", "Support", "Tags"]}
            selectedId={templateId}
            onRowClick={setSelectedTemplateId}
            rows={templates.map((item) => ({
              id: item.id,
              cells: [item.name, item.support, item.tagNames.join(", ") || "—"],
            }))}
          />
        )}
        {templateDetailQuery.data ? (
          <div
            className="rounded-lg border border-[var(--color-border)] p-4"
            data-testid="workflow-engine-template-detail"
          >
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              {templateDetailQuery.data.name}
            </h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                <dd>{templateDetailQuery.data.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Description</dt>
                <dd>{templateDetailQuery.data.description ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Usage</dt>
                <dd className="text-[var(--color-muted-foreground)]">
                  Usage counts are not returned by the engine metadata API.
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
    );
  } else if (section === "projects") {
    const projects = projectsQuery.data?.items ?? [];
    body = projectsQuery.isError ? (
      <ErrorState
        message={toWorkflowEngineUserMessage(projectsQuery.error)}
        forbidden={isForbidden(projectsQuery.error)}
        onRetry={() => void projectsQuery.refetch()}
      />
    ) : projects.length === 0 ? (
      <EmptyState title="No projects" />
    ) : (
      <DataTable
        caption="Engine projects"
        columns={["Name", "Type", "Support", "Workflows"]}
        rows={projects.map((item) => ({
          id: item.id,
          cells: [
            item.name,
            item.type ?? "—",
            item.support ?? "—",
            "Not counted by metadata API",
          ],
        }))}
      />
    );
  } else if (section === "users") {
    const users = usersQuery.data?.items ?? [];
    body = usersQuery.isError ? (
      <ErrorState
        message={toWorkflowEngineUserMessage(usersQuery.error)}
        forbidden={isForbidden(usersQuery.error)}
        onRetry={() => void usersQuery.refetch()}
      />
    ) : users.length === 0 ? (
      <EmptyState title="No users" />
    ) : (
      <DataTable
        caption="Engine users"
        columns={["Display name", "Email", "Role", "Assignments"]}
        rows={users.map((item) => ({
          id: item.id,
          cells: [
            item.displayName ?? "—",
            item.email ?? "—",
            item.role ?? "—",
            "Metadata only",
          ],
        }))}
      />
    );
  } else if (section === "tags") {
    const tags = tagsQuery.data?.items ?? [];
    body = tagsQuery.isError ? (
      <ErrorState
        message={toWorkflowEngineUserMessage(tagsQuery.error)}
        forbidden={isForbidden(tagsQuery.error)}
        onRetry={() => void tagsQuery.refetch()}
      />
    ) : tags.length === 0 ? (
      <EmptyState title="No tags" />
    ) : (
      <DataTable
        caption="Engine tags"
        columns={["Name", "Updated", "Usage"]}
        rows={tags.map((item) => ({
          id: item.id,
          cells: [
            item.name,
            item.updatedAt ?? "—",
            `${workflows.filter((w) => w.tagNames.includes(item.name)).length} workflow(s)`,
          ],
        }))}
      />
    );
  } else if (section === "capabilities") {
    if (!canViewCapabilities) {
      body = (
        <ErrorState
          message="You do not have permission to view engine capabilities."
          forbidden
        />
      );
    } else if (capabilitiesQuery.isLoading && !capabilitiesQuery.data) {
      body = (
        <p data-testid="workflow-engine-loading" className="text-sm">
          Loading capabilities…
        </p>
      );
    } else if (capabilitiesQuery.isError) {
      body = (
        <ErrorState
          message={toWorkflowEngineUserMessage(capabilitiesQuery.error)}
          forbidden={isForbidden(capabilitiesQuery.error)}
          onRetry={() => void capabilitiesQuery.refetch()}
        />
      );
    } else {
      const caps = capabilitiesQuery.data!;
      body = (
        <div className="flex flex-col gap-4" data-testid="workflow-engine-capabilities">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatusCard label="Provider / API" value="Workflow Engine metadata API" />
            <StatusCard label="Authentication" value="session + server authz" />
          </div>
          <section aria-label="Supported capabilities">
            <h2 className="mb-2 text-sm font-semibold">Supported</h2>
            <ul className="list-inside list-disc text-sm">
              {caps.services.map((service) => (
                <li key={service.serviceId}>
                  {service.serviceId}: {service.operations.join(", ") || "—"} (
                  {service.support})
                </li>
              ))}
            </ul>
          </section>
          <section aria-label="Unsupported capabilities">
            <h2 className="mb-2 text-sm font-semibold">Unsupported</h2>
            <ul className="list-inside list-disc text-sm">
              {caps.unsupportedOperations.map((op) => (
                <li key={op}>{op}</li>
              ))}
            </ul>
          </section>
        </div>
      );
    }
  } else if (section === "health") {
    if (!canViewHealth) {
      body = (
        <ErrorState
          message="You do not have permission to view engine health."
          forbidden
        />
      );
    } else if (healthQuery.isLoading && !healthQuery.data) {
      body = (
        <p data-testid="workflow-engine-loading" className="text-sm">
          Loading health…
        </p>
      );
    } else if (healthQuery.isError) {
      body = (
        <ErrorState
          message={toWorkflowEngineUserMessage(healthQuery.error)}
          forbidden={isForbidden(healthQuery.error)}
          onRetry={() => void healthQuery.refetch()}
        />
      );
    } else {
      const health = healthQuery.data!;
      body = (
        <div className="grid gap-3 sm:grid-cols-2" data-testid="workflow-engine-health">
          <StatusCard label="Level" value={health.level} />
          <StatusCard label="SDK status" value={health.sdkStatus} />
          <StatusCard label="Reasons" value={health.reasons.join("; ") || "none"} />
          <StatusCard label="Mode" value="READ-ONLY ENGINE" emphasize />
        </div>
      );
    }
  } else if (section === "diagnostics") {
    if (!canViewDiagnostics) {
      body = (
        <ErrorState
          message="You do not have permission to view engine diagnostics."
          forbidden
        />
      );
    } else if (diagnosticsQuery.isLoading && !diagnosticsQuery.data) {
      body = (
        <p data-testid="workflow-engine-loading" className="text-sm">
          Loading diagnostics…
        </p>
      );
    } else if (diagnosticsQuery.isError) {
      body = (
        <ErrorState
          message={toWorkflowEngineUserMessage(diagnosticsQuery.error)}
          forbidden={isForbidden(diagnosticsQuery.error)}
          onRetry={() => void diagnosticsQuery.refetch()}
        />
      );
    } else {
      const d = diagnosticsQuery.data!;
      body = (
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="workflow-engine-diagnostics"
        >
          <StatusCard label="Health" value={d.healthLevel} />
          <StatusCard label="Readiness (API)" value={d.apiStatus} />
          <StatusCard
            label="Latency"
            value={d.lastLatencyMs !== undefined ? `${d.lastLatencyMs} ms` : "—"}
          />
          <StatusCard label="Compatibility" value={d.compatibilityStatus} />
          <StatusCard label="Provider version" value={d.adapterVersion} />
          <StatusCard label="Auth mode" value={d.authMode} />
          <StatusCard label="Auth status" value={d.authenticationStatus} />
          <StatusCard
            label="Supported operations (core count)"
            value={String(d.coreServiceCount)}
          />
          <StatusCard label="Mode" value="READ-ONLY ENGINE" emphasize />
        </div>
      );
    }
  } else if (section === "compatibility") {
    if (!canViewCapabilities) {
      body = (
        <ErrorState
          message="You do not have permission to view engine compatibility."
          forbidden
        />
      );
    } else if (compatibilityQuery.isLoading && !compatibilityQuery.data) {
      body = (
        <p data-testid="workflow-engine-loading" className="text-sm">
          Loading compatibility…
        </p>
      );
    } else if (compatibilityQuery.isError) {
      body = (
        <ErrorState
          message={toWorkflowEngineUserMessage(compatibilityQuery.error)}
          forbidden={isForbidden(compatibilityQuery.error)}
          onRetry={() => void compatibilityQuery.refetch()}
        />
      );
    } else {
      const c = compatibilityQuery.data!;
      body = (
        <div
          className="flex flex-col gap-4"
          data-testid="workflow-engine-compatibility"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <StatusCard label="Status" value={c.compatibilityStatus} />
            <StatusCard label="Supported API" value={c.supportedApi} />
            <StatusCard label="Adapter version" value={c.adapterVersion} />
          </div>
          <section aria-label="Supported capabilities">
            <h2 className="mb-2 text-sm font-semibold">Supported capabilities</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Read-only metadata: list/get workflows, templates, projects, users, tags,
              capabilities, health, diagnostics, compatibility, validate.
            </p>
          </section>
          <section aria-label="Unsupported capabilities">
            <h2 className="mb-2 text-sm font-semibold">Unsupported</h2>
            <ul className="list-inside list-disc text-sm">
              {c.unsupportedOperations.map((op) => (
                <li key={op}>{op}</li>
              ))}
            </ul>
          </section>
          <section aria-label="Known limitations">
            <h2 className="mb-2 text-sm font-semibold">Known limitations</h2>
            <ul className="list-inside list-disc text-sm">
              {c.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
      );
    }
  }

  return (
    <PageShell
      title={SECTION_META[section].title}
      description={SECTION_META[section].description}
      actions={commands}
    >
      {statusRegion}
      {body}
      {apiMetadataOpen ? (
        <div
          className="rounded-lg border border-[var(--color-border)] p-4"
          data-testid="workflow-engine-api-metadata"
          role="region"
          aria-label="API metadata"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              API metadata
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApiMetadataOpen(false)}
            >
              Close
            </Button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-[var(--color-muted-foreground)]">
            {JSON.stringify(
              {
                base: WORKFLOW_ENGINE_API_BASE,
                selectedWorkflowId: selectedId,
                workflow: detailQuery.data ?? null,
                mode: "READ-ONLY ENGINE",
              },
              null,
              2,
            )}
          </pre>
        </div>
      ) : null}
    </PageShell>
  );
}
