"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import {
  archiveWorkflow,
  getWorkflow,
  getWorkflowCapabilities,
  getWorkflowDiagnostics,
  getWorkflowHealth,
  getWorkflowReadiness,
  getWorkflowTemplate,
  getWorkflowVersion,
  listWorkflowAudit,
  listWorkflowCategories,
  listWorkflowFolders,
  listWorkflows,
  listWorkflowTemplates,
  listWorkflowVersions,
  publishWorkflow,
  restoreWorkflow,
  transitionWorkflow,
  validateWorkflow,
  workflowQueryKeys,
} from "@/lib/workflows/workflow-api";
import { WorkflowClientError, toWorkflowUserMessage } from "@/lib/workflows/workflow-errors";
import type {
  WorkflowSummaryViewModel,
  WorkflowVersionViewModel,
} from "@/lib/workflows/workflow-types";
import type { WorkflowsSection } from "@/lib/workflows/routes";

import { AuditTimeline } from "./audit-timeline";
import { DefinitionGraph } from "./definition-graph";
import { DefinitionViewer } from "./definition-viewer";
import { VersionCompare } from "./version-compare";
import {
  buildWorkflowExportPayload,
  downloadTextFile,
  exportWorkflowAsJson,
  exportWorkflowAsMarkdown,
  exportWorkflowAsYaml,
} from "./workflow-export";

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
    <div className="flex flex-col gap-6 p-1" data-testid="workflows-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Workflows
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
      data-testid="workflows-empty"
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
      data-testid={forbidden ? "workflows-forbidden" : "workflows-error"}
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {forbidden ? "Access denied" : "Unable to load workflows"}
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
}: {
  readonly label: string;
  readonly value: string;
  readonly testId?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-3"
      data-testid={testId}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

function WorkflowsTable({
  columns,
  rows,
  caption,
  onRowClick,
  selectedId,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly caption?: string;
  readonly onRowClick?: (id: string) => void;
  readonly selectedId?: string | null;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid="workflows-table"
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
              data-testid={`workflows-row-${row.id}`}
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
    error instanceof WorkflowClientError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof WorkflowClientError && error.status === 404;
}

const SECTION_META: Record<
  WorkflowsSection,
  { readonly title: string; readonly description: string }
> = {
  overview: {
    title: "Overview",
    description: "Workflow metadata dashboard — execution is not available.",
  },
  workflows: {
    title: "Workflows",
    description: "Workflow library and lifecycle metadata.",
  },
  versions: {
    title: "Versions",
    description: "Version list, definition viewer, graph, and compare.",
  },
  templates: {
    title: "Templates",
    description: "Template catalogue — view only; no editor.",
  },
  categories: {
    title: "Categories",
    description: "Workflow category catalogue.",
  },
  folders: {
    title: "Folders",
    description: "Workflow folder catalogue.",
  },
  validation: {
    title: "Validation",
    description: "Structural validation issues grouped by severity.",
  },
  audit: {
    title: "Audit",
    description: "Workflow audit timeline.",
  },
  diagnostics: {
    title: "Diagnostics",
    description: "Capabilities, health, and readiness — execution unavailable.",
  },
};

export function PlatformWorkflowsView({
  section = "overview",
  canPublish = true,
}: {
  readonly section?: WorkflowsSection;
  /** Server remains authoritative; UI may hide publish when false. */
  readonly canPublish?: boolean;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null,
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  const [compareLeftId, setCompareLeftId] = useState<string | null>(null);
  const [compareRightId, setCompareRightId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transitionTarget, setTransitionTarget] = useState("review");
  const [apiMetadataOpen, setApiMetadataOpen] = useState(false);

  const listQuery = useQuery({
    queryKey: workflowQueryKeys.list({
      query: search.trim() || undefined,
      lifecycle: lifecycleFilter || undefined,
    }),
    queryFn: ({ signal }) =>
      listWorkflows(
        {
          query: search.trim() || undefined,
          lifecycle: lifecycleFilter || undefined,
          limit: 100,
        },
        { signal },
      ),
  });

  const selectedId =
    selectedWorkflowId ?? listQuery.data?.items[0]?.id ?? null;

  const detailQuery = useQuery({
    queryKey: workflowQueryKeys.detail(selectedId ?? ""),
    queryFn: ({ signal }) => getWorkflow(selectedId!, { signal }),
    enabled: Boolean(selectedId),
  });

  const versionsQuery = useQuery({
    queryKey: workflowQueryKeys.versions(selectedId ?? ""),
    queryFn: ({ signal }) => listWorkflowVersions(selectedId!, { signal }),
    enabled: Boolean(selectedId),
  });

  const activeVersionId =
    selectedVersionId ??
    compareRightId ??
    versionsQuery.data?.items[0]?.id ??
    detailQuery.data?.currentVersionId ??
    null;

  const versionDetailQuery = useQuery({
    queryKey: workflowQueryKeys.version(selectedId ?? "", activeVersionId ?? ""),
    queryFn: ({ signal }) =>
      getWorkflowVersion(selectedId!, activeVersionId!, { signal }),
    enabled: Boolean(selectedId && activeVersionId),
  });

  const compareLeftQuery = useQuery({
    queryKey: workflowQueryKeys.version(
      selectedId ?? "",
      compareLeftId ?? "",
    ),
    queryFn: ({ signal }) =>
      getWorkflowVersion(selectedId!, compareLeftId!, { signal }),
    enabled: Boolean(selectedId && compareLeftId),
  });

  const compareRightQuery = useQuery({
    queryKey: workflowQueryKeys.version(
      selectedId ?? "",
      compareRightId ?? "",
    ),
    queryFn: ({ signal }) =>
      getWorkflowVersion(selectedId!, compareRightId!, { signal }),
    enabled: Boolean(selectedId && compareRightId),
  });

  const auditQuery = useQuery({
    queryKey: workflowQueryKeys.audit(selectedId ?? ""),
    queryFn: ({ signal }) => listWorkflowAudit(selectedId!, { signal }),
    enabled: Boolean(selectedId) && section === "audit",
  });

  const templatesQuery = useQuery({
    queryKey: workflowQueryKeys.templates.list(),
    queryFn: ({ signal }) => listWorkflowTemplates({ signal }),
    enabled: section === "templates" || section === "overview",
  });

  const selectedTplId =
    selectedTemplateId ?? templatesQuery.data?.items[0]?.id ?? null;

  const templateDetailQuery = useQuery({
    queryKey: workflowQueryKeys.templates.detail(selectedTplId ?? ""),
    queryFn: ({ signal }) => getWorkflowTemplate(selectedTplId!, { signal }),
    enabled: Boolean(selectedTplId) && section === "templates",
  });

  const categoriesQuery = useQuery({
    queryKey: workflowQueryKeys.categories.list(),
    queryFn: ({ signal }) => listWorkflowCategories({ signal }),
    enabled: section === "categories" || section === "overview",
  });

  const foldersQuery = useQuery({
    queryKey: workflowQueryKeys.folders.list(),
    queryFn: ({ signal }) => listWorkflowFolders({ signal }),
    enabled:
      section === "folders" ||
      section === "overview" ||
      section === "workflows",
  });

  const capabilitiesQuery = useQuery({
    queryKey: workflowQueryKeys.capabilities(),
    queryFn: ({ signal }) => getWorkflowCapabilities({ signal }),
    enabled: section === "diagnostics" || section === "overview",
  });

  const healthQuery = useQuery({
    queryKey: workflowQueryKeys.health(),
    queryFn: ({ signal }) => getWorkflowHealth({ signal }),
    enabled: section === "diagnostics" || section === "overview",
  });

  const readinessQuery = useQuery({
    queryKey: workflowQueryKeys.readiness(),
    queryFn: ({ signal }) => getWorkflowReadiness({ signal }),
    enabled: section === "diagnostics" || section === "overview",
  });

  const diagnosticsQuery = useQuery({
    queryKey: workflowQueryKeys.diagnostics(),
    queryFn: ({ signal }) => getWorkflowDiagnostics({ signal }),
    enabled: section === "diagnostics" || section === "overview",
  });

  const validationQuery = useQuery({
    queryKey: [...workflowQueryKeys.detail(selectedId ?? ""), "validation"],
    queryFn: ({ signal }) =>
      validateWorkflow(
        {
          workflowId: selectedId!,
          versionId: activeVersionId ?? undefined,
        },
        { signal },
      ),
    enabled:
      Boolean(selectedId) &&
      (section === "validation" || section === "overview"),
  });

  const invalidateWorkflowCaches = async () => {
    await queryClient.invalidateQueries({ queryKey: workflowQueryKeys.all });
  };

  const lifecycleMutation = useMutation({
    mutationFn: async (
      action: "publish" | "archive" | "restore" | "transition",
    ) => {
      if (!selectedId) throw new Error("Select a workflow first.");
      if (action === "publish") return publishWorkflow(selectedId);
      if (action === "archive") return archiveWorkflow(selectedId);
      if (action === "restore") return restoreWorkflow(selectedId);
      return transitionWorkflow(selectedId, { to: transitionTarget });
    },
    onSuccess: async (_data, action) => {
      setActionError(null);
      setStatusMessage(`Lifecycle ${action} completed.`);
      await invalidateWorkflowCaches();
    },
    onError: (error) => {
      setActionError(toWorkflowUserMessage(error));
      setStatusMessage(null);
    },
  });

  const items: readonly WorkflowSummaryViewModel[] =
    listQuery.data?.items ?? [];

  const lifecycleCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.lifecycle, (map.get(item.lifecycle) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const dependencyRows = useMemo(() => {
    const workflow = detailQuery.data;
    if (!workflow) return [];
    return [
      { id: "category", label: "Category", value: workflow.categoryId ?? "—" },
      { id: "folder", label: "Folder", value: workflow.folderId ?? "—" },
      { id: "template", label: "Template", value: workflow.templateId ?? "—" },
      {
        id: "version",
        label: "Current version",
        value: workflow.currentVersionId ?? "—",
      },
    ];
  }, [detailQuery.data]);

  const validationGroups = useMemo(() => {
    const issues = validationQuery.data?.issues ?? [];
    const categories = [
      "Structure",
      "References",
      "Variables",
      "Parameters",
      "Lifecycle",
      "Security",
      "Compatibility",
      "Warnings",
      "Errors",
      "History",
    ] as const;
    const groups = new Map<string, typeof issues>(
      categories.map((category) => [category, []]),
    );
    for (const issue of issues) {
      const haystack = `${issue.code} ${issue.path ?? ""}`.toLowerCase();
      let category: (typeof categories)[number] = "Structure";
      if (haystack.includes("reference")) category = "References";
      else if (haystack.includes("variable")) category = "Variables";
      else if (haystack.includes("parameter")) category = "Parameters";
      else if (haystack.includes("lifecycle")) category = "Lifecycle";
      else if (haystack.includes("security") || haystack.includes("secret"))
        category = "Security";
      else if (haystack.includes("compat")) category = "Compatibility";
      else if (haystack.includes("history") || haystack.includes("audit"))
        category = "History";
      else if (haystack.includes("structure")) category = "Structure";
      else if (issue.severity === "error") category = "Errors";
      else if (issue.severity === "warning") category = "Warnings";
      groups.set(category, [...(groups.get(category) ?? []), issue]);
      if (issue.severity === "error" && category !== "Errors") {
        groups.set("Errors", [...(groups.get("Errors") ?? []), issue]);
      }
      if (issue.severity === "warning" && category !== "Warnings") {
        groups.set("Warnings", [...(groups.get("Warnings") ?? []), issue]);
      }
    }
    return categories.map((category) => [category, groups.get(category) ?? []] as const);
  }, [validationQuery.data?.issues]);

  async function refreshAll() {
    setActionError(null);
    setStatusMessage("Refreshed.");
    await invalidateWorkflowCaches();
  }

  async function copyWorkflowId() {
    if (!selectedId) {
      setActionError("Select a workflow first.");
      return;
    }
    try {
      await copyText(selectedId);
      setStatusMessage(`Copied workflow ID ${selectedId}`);
      setActionError(null);
    } catch (error) {
      setActionError(toWorkflowUserMessage(error));
    }
  }

  function exportMetadata(format: "json" | "yaml" | "markdown") {
    const workflow = detailQuery.data;
    if (!workflow) {
      setActionError("Select a workflow first.");
      return;
    }
    const payload = buildWorkflowExportPayload(
      workflow,
      versionDetailQuery.data ?? null,
    );
    const base = `workflow-${workflow.key || workflow.id}`;
    if (format === "json") {
      downloadTextFile(
        `${base}.json`,
        exportWorkflowAsJson(payload),
        "application/json",
      );
    } else if (format === "yaml") {
      downloadTextFile(
        `${base}.yaml`,
        exportWorkflowAsYaml(payload),
        "text/yaml",
      );
    } else {
      downloadTextFile(
        `${base}.md`,
        exportWorkflowAsMarkdown(payload),
        "text/markdown",
      );
    }
    setStatusMessage(`Exported ${format.toUpperCase()} metadata.`);
    setActionError(null);
  }

  const versions: readonly WorkflowVersionViewModel[] =
    versionsQuery.data?.items ?? [];

  const commands = (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Workflows commands"
    >
      <Button type="button" variant="outline" size="sm" onClick={() => void refreshAll()}>
        Refresh
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => void copyWorkflowId()}
      >
        Copy ID
      </Button>
      {canPublish ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!selectedId || lifecycleMutation.isPending}
          onClick={() => lifecycleMutation.mutate("publish")}
          data-testid="workflows-publish"
        >
          Publish
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId || lifecycleMutation.isPending}
        onClick={() => lifecycleMutation.mutate("archive")}
      >
        Archive
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId || lifecycleMutation.isPending}
        onClick={() => lifecycleMutation.mutate("restore")}
      >
        Restore
      </Button>
      <label className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
        Transition
        <Input
          value={transitionTarget}
          onChange={(event) => setTransitionTarget(event.target.value)}
          className="h-8 w-28"
          aria-label="Transition target lifecycle"
        />
      </label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId || lifecycleMutation.isPending}
        onClick={() => lifecycleMutation.mutate("transition")}
      >
        Transition
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!selectedId}
        onClick={() => {
          void queryClient.fetchQuery({
            queryKey: [
              ...workflowQueryKeys.detail(selectedId!),
              "validation",
              "command",
            ],
            queryFn: () =>
              validateWorkflow({
                workflowId: selectedId!,
                versionId: activeVersionId ?? undefined,
              }),
          }).then(
            (result) => {
              setStatusMessage(
                result.valid
                  ? "Validation passed."
                  : `Validation reported ${result.issues.length} issue(s).`,
              );
              setActionError(null);
            },
            (error: unknown) => {
              setActionError(toWorkflowUserMessage(error));
            },
          );
        }}
      >
        Validate
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!detailQuery.data}
        onClick={() => exportMetadata("json")}
      >
        Export JSON
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!detailQuery.data}
        onClick={() => exportMetadata("yaml")}
      >
        Export YAML
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!detailQuery.data}
        onClick={() => exportMetadata("markdown")}
      >
        Export Markdown
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!detailQuery.data}
        onClick={() => {
          setApiMetadataOpen(true);
          setStatusMessage("Opened API metadata (export envelope).");
          setActionError(null);
        }}
        data-testid="workflows-open-api-metadata"
      >
        Open API Metadata
      </Button>
    </div>
  );

  const filters = (
    <div className="flex flex-wrap items-end gap-3" data-testid="workflows-filters">
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Search
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter via HTTP query…"
          aria-label="Filter workflows by query"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
        Lifecycle
        <Input
          value={lifecycleFilter}
          onChange={(event) => setLifecycleFilter(event.target.value)}
          placeholder="lifecycle"
          aria-label="Filter by lifecycle"
        />
      </label>
    </div>
  );

  const statusRegion = (
    <div
      className="flex flex-col gap-1"
      role="status"
      aria-live="polite"
      data-testid="workflows-status"
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

  if (listQuery.isLoading && !listQuery.data) {
    return (
      <PageShell title={SECTION_META[section].title}>
        <p data-testid="workflows-loading" className="text-sm text-[var(--color-muted-foreground)]">
          Loading workflows…
        </p>
      </PageShell>
    );
  }

  if (listQuery.isError) {
    const err = listQuery.error;
    return (
      <PageShell title={SECTION_META[section].title}>
        <ErrorState
          message={toWorkflowUserMessage(err)}
          forbidden={isForbidden(err)}
          onRetry={() => void listQuery.refetch()}
        />
      </PageShell>
    );
  }

  const workflowListPanel = (
    <div className="flex flex-col gap-3">
      {filters}
      {items.length === 0 ? (
        <EmptyState
          title="No workflows found"
          description="Adjust search filters or create workflows via the HTTP API."
        />
      ) : (
        <WorkflowsTable
          caption="Workflow library"
          columns={["Name", "Key", "Lifecycle", "Updated"]}
          selectedId={selectedId}
          onRowClick={setSelectedWorkflowId}
          rows={items.map((item) => ({
            id: item.id,
            cells: [item.name, item.key, item.lifecycle, item.updatedAt],
          }))}
        />
      )}
    </div>
  );

  const detailPanel =
    selectedId && detailQuery.isError && isNotFound(detailQuery.error) ? (
      <EmptyState
        title="Workflow not found"
        description="The selected workflow no longer exists."
      />
    ) : detailQuery.data ? (
      <div
        className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4"
        data-testid="workflows-detail-panel"
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
            <dt className="text-[var(--color-muted-foreground)]">Key</dt>
            <dd className="text-[var(--color-foreground)]">{detailQuery.data.key}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Lifecycle</dt>
            <dd className="text-[var(--color-foreground)]">
              {detailQuery.data.lifecycle}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Description</dt>
            <dd className="text-[var(--color-foreground)]">
              {detailQuery.data.description ?? "—"}
            </dd>
          </div>
        </dl>
        <div data-testid="workflows-dependency-panel">
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-foreground)]">
            Dependencies
          </h3>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {dependencyRows.map((row) => (
              <li key={row.id} className="text-[var(--color-foreground)]">
                <span className="text-[var(--color-muted-foreground)]">
                  {row.label}:
                </span>{" "}
                {row.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : null;

  let body: ReactNode = null;

  if (section === "overview") {
    body = (
      <div className="flex flex-col gap-4">
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="workflows-overview-cards"
        >
          <StatusCard
            label="Workflows"
            value={String(items.length)}
            testId="card-workflows-count"
          />
          <StatusCard
            label="Templates"
            value={String(templatesQuery.data?.items.length ?? "—")}
          />
          <StatusCard
            label="Categories"
            value={String(categoriesQuery.data?.items.length ?? "—")}
          />
          <StatusCard
            label="Execution Status"
            value="Workflow Execution Not Available"
            testId="card-execution-status"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...lifecycleCounts.entries()].map(([lifecycle, count]) => (
            <StatusCard
              key={lifecycle}
              label={`Lifecycle: ${lifecycle}`}
              value={String(count)}
            />
          ))}
          <StatusCard
            label="Platform enabled"
            value={
              capabilitiesQuery.data?.workflowEnabled
                ? "Yes"
                : diagnosticsQuery.data?.workflowEnabled
                  ? "Yes"
                  : "—"
            }
          />
        </div>
        {workflowListPanel}
      </div>
    );
  } else if (section === "workflows") {
    body = (
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {workflowListPanel}
        <div className="flex flex-col gap-4">
          {detailPanel}
          <DefinitionViewer definition={versionDetailQuery.data ?? null} />
          <DefinitionGraph graph={versionDetailQuery.data?.graph} />
        </div>
      </div>
    );
  } else if (section === "versions") {
    body = (
      <div className="flex flex-col gap-4">
        {workflowListPanel}
        {versions.length === 0 ? (
          <EmptyState title="No versions" description="Selected workflow has no versions." />
        ) : (
          <WorkflowsTable
            caption="Workflow versions"
            columns={["Version", "Status", "Lifecycle", "Created", "Summary"]}
            selectedId={activeVersionId}
            onRowClick={(id) => {
              setSelectedVersionId(id);
              if (!compareLeftId) setCompareLeftId(id);
              else setCompareRightId(id);
            }}
            rows={versions.map((v) => ({
              id: v.id,
              cells: [
                `v${v.versionNumber}`,
                v.status,
                v.lifecycle,
                v.createdAt,
                v.changeSummary ?? "—",
              ],
            }))}
          />
        )}
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
            Compare left
            <select
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[var(--color-foreground)]"
              value={compareLeftId ?? ""}
              onChange={(e) => setCompareLeftId(e.target.value || null)}
              aria-label="Compare left version"
            >
              <option value="">Select…</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.versionNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
            Compare right
            <select
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-[var(--color-foreground)]"
              value={compareRightId ?? ""}
              onChange={(e) => setCompareRightId(e.target.value || null)}
              aria-label="Compare right version"
            >
              <option value="">Select…</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.versionNumber}
                </option>
              ))}
            </select>
          </label>
        </div>
        <VersionCompare
          left={compareLeftQuery.data}
          right={compareRightQuery.data}
        />
        <DefinitionViewer definition={versionDetailQuery.data ?? null} />
        <DefinitionGraph graph={versionDetailQuery.data?.graph} />
      </div>
    );
  } else if (section === "templates") {
    const templates = templatesQuery.data?.items ?? [];
    body = (
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {templatesQuery.isError ? (
          <ErrorState
            message={toWorkflowUserMessage(templatesQuery.error)}
            forbidden={isForbidden(templatesQuery.error)}
            onRetry={() => void templatesQuery.refetch()}
          />
        ) : templates.length === 0 ? (
          <EmptyState title="No templates" />
        ) : (
          <WorkflowsTable
            caption="Templates"
            columns={["Name", "Key", "Lifecycle", "Updated"]}
            selectedId={selectedTplId}
            onRowClick={setSelectedTemplateId}
            rows={templates.map((t) => ({
              id: t.id,
              cells: [t.name, t.key, t.lifecycle, t.updatedAt],
            }))}
          />
        )}
        <div className="flex flex-col gap-3">
          {templateDetailQuery.data ? (
            <div
              className="rounded-lg border border-[var(--color-border)] p-4"
              data-testid="workflows-template-detail"
            >
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {templateDetailQuery.data.name}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {templateDetailQuery.data.description ?? "No description"}
              </p>
              <p className="mt-2 text-sm text-[var(--color-foreground)]">
                Key: {templateDetailQuery.data.key}
              </p>
            </div>
          ) : null}
          <DefinitionViewer
            definition={templateDetailQuery.data ?? null}
            title="Template definition"
          />
          <DefinitionGraph graph={templateDetailQuery.data?.graph} />
        </div>
      </div>
    );
  } else if (section === "categories") {
    const categories = categoriesQuery.data?.items ?? [];
    body =
      categories.length === 0 ? (
        <EmptyState title="No categories" />
      ) : (
        <WorkflowsTable
          caption="Categories"
          columns={["Name", "Description", "Parent", "Updated"]}
          rows={categories.map((c) => ({
            id: c.id,
            cells: [
              c.name,
              c.description ?? "—",
              c.parentCategoryId ?? "—",
              c.updatedAt,
            ],
          }))}
        />
      );
  } else if (section === "folders") {
    const folders = foldersQuery.data?.items ?? [];
    body =
      folders.length === 0 ? (
        <EmptyState title="No folders" />
      ) : (
        <WorkflowsTable
          caption="Folders"
          columns={["Name", "Path", "Parent", "Updated"]}
          rows={folders.map((f) => ({
            id: f.id,
            cells: [
              f.name,
              f.path,
              f.parentFolderId ?? "—",
              f.updatedAt,
            ],
          }))}
        />
      );
  } else if (section === "validation") {
    body = (
      <div className="flex flex-col gap-4">
        {workflowListPanel}
        {validationQuery.isLoading ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Validating…
          </p>
        ) : validationQuery.isError ? (
          <ErrorState
            message={toWorkflowUserMessage(validationQuery.error)}
            forbidden={isForbidden(validationQuery.error)}
            onRetry={() => void validationQuery.refetch()}
          />
        ) : (
          <div data-testid="workflows-validation-panel">
            <StatusCard
              label="Result"
              value={
                validationQuery.data?.valid
                  ? "Valid"
                  : `Invalid (${validationQuery.data?.issues.length ?? 0} issues)`
              }
            />
            {validationGroups.length === 0 ? (
              <EmptyState
                title="No validation issues"
                description="Structural validation reported no issues."
              />
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {validationGroups.map(([severity, issues]) => (
                  <section
                    key={severity}
                    className="rounded-lg border border-[var(--color-border)] p-3"
                    aria-label={`${severity} issues`}
                  >
                    <h3 className="text-sm font-semibold capitalize text-[var(--color-foreground)]">
                      {severity}
                    </h3>
                    <ul className="mt-2 flex flex-col gap-1 text-sm">
                      {issues.map((issue, index) => (
                        <li key={`${issue.code}-${index}`}>
                          <span className="font-medium">{issue.code}</span>
                          {issue.path ? ` @ ${issue.path}` : ""}: {issue.message}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  } else if (section === "audit") {
    body = (
      <div className="flex flex-col gap-4">
        {workflowListPanel}
        {auditQuery.isError ? (
          <ErrorState
            message={toWorkflowUserMessage(auditQuery.error)}
            forbidden={isForbidden(auditQuery.error)}
            onRetry={() => void auditQuery.refetch()}
          />
        ) : (
          <AuditTimeline entries={auditQuery.data?.items ?? []} />
        )}
      </div>
    );
  } else if (section === "diagnostics") {
    const caps = capabilitiesQuery.data ?? diagnosticsQuery.data;
    body = (
      <div
        className="flex flex-col gap-4"
        data-testid="workflows-diagnostics-panel"
      >
        <StatusCard
          label="Execution Status"
          value="Workflow Execution Not Available"
          testId="diagnostics-execution-status"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            label="Workflow enabled"
            value={caps?.workflowEnabled ? "Yes" : "No"}
          />
          <StatusCard
            label="Execution enabled"
            value={String(caps?.executionEnabled ?? false)}
          />
          <StatusCard
            label="Engine configured"
            value={String(caps?.engineConfigured ?? false)}
          />
          <StatusCard
            label="Persistence"
            value={caps?.persistenceMode ?? "—"}
          />
          <StatusCard
            label="Health"
            value={
              healthQuery.data?.healthy
                ? "Healthy"
                : healthQuery.data?.status ?? "—"
            }
          />
          <StatusCard
            label="Readiness"
            value={
              readinessQuery.data?.ready
                ? "Ready"
                : readinessQuery.data?.status ?? "—"
            }
          />
        </div>
        {caps?.capabilities ? (
          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
              Capabilities
            </h3>
            <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              {Object.entries(caps.capabilities).map(([key, value]) => (
                <li key={key} className="text-[var(--color-foreground)]">
                  {key}: {String(value)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <PageShell
      title={SECTION_META[section].title}
      description={SECTION_META[section].description}
      actions={commands}
    >
      {statusRegion}
      {body}
    </PageShell>
  );
}
