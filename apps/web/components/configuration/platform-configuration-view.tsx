"use client";

/**
 * Platform Configuration Workbench (APZCONFIG-004).
 * Consumes only configuration typed-client facades — no gateway/core/persistence.
 * Management plane only — runtime resolution, feature flags, and secrets unavailable.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import {
  approveConfiguration,
  archiveConfiguration,
  deprecateConfiguration,
  getConfiguration,
  getConfigurationCapabilities,
  getConfigurationDiagnostics,
  getConfigurationHealth,
  getConfigurationNamespace,
  getConfigurationReadiness,
  getConfigurationReference,
  getConfigurationScope,
  listConfigurationAudit,
  listConfigurationGroups,
  listConfigurationNamespaces,
  listConfigurationOverrides,
  listConfigurationReferences,
  listConfigurations,
  listConfigurationScopes,
  listConfigurationValidationRules,
  listConfigurationVersions,
  publishConfiguration,
  publishConfigurationVersion,
  restoreConfiguration,
  transitionConfiguration,
  validateConfiguration,
  validateConfigurationMetadata,
} from "@/lib/configuration/configuration-api";
import { configurationQueryKeys } from "@/lib/configuration/query-keys";
import {
  ConfigurationClientError,
  toConfigurationUserMessage,
} from "@/lib/configuration/configuration-errors";
import type { ConfigurationSection } from "@/lib/configuration/routes";

const RUNTIME_BANNER = "RUNTIME RESOLUTION NOT AVAILABLE";
const FLAGS_BANNER = "FEATURE FLAGS NOT AVAILABLE";
const SECRETS_BANNER = "SECRET MANAGEMENT NOT AVAILABLE";
const HOT_RELOAD_BANNER = "HOT RELOAD NOT AVAILABLE";
const OVERRIDE_NOTICE =
  "OVERRIDE METADATA ONLY — EFFECTIVE VALUE IS NOT RESOLVED";
const IMMUTABLE_NOTICE = "IMMUTABLE PUBLISHED VERSION";
const VALUE_HIDDEN =
  "VALUE HIDDEN — SECRET MANAGEMENT IS OUTSIDE PLATFORM CONFIGURATION";

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
    <div className="flex flex-col gap-6 p-1" data-testid="configuration-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Configuration
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
      data-testid="configuration-empty"
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
  notFound,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly forbidden?: boolean;
  readonly notFound?: boolean;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid={
        forbidden
          ? "configuration-forbidden"
          : notFound
            ? "configuration-not-found"
            : "configuration-error"
      }
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {forbidden
          ? "Access denied"
          : notFound
            ? "Not found"
            : "Unable to load configuration"}
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
        emphasize
          ? "border-[var(--color-destructive)]/40 bg-[var(--color-muted)]/40"
          : "",
      ].join(" ")}
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

function MetaTable({
  columns,
  rows,
  caption,
  onRowClick,
  selectedId,
  testId = "configuration-table",
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly caption?: string;
  readonly onRowClick?: (id: string) => void;
  readonly selectedId?: string | null;
  readonly testId?: string;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid={testId}
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
                onRowClick
                  ? "cursor-pointer hover:bg-[var(--color-muted)]/30"
                  : "",
                selectedId === row.id ? "bg-[var(--color-muted)]/40" : "",
              ].join(" ")}
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
              aria-selected={selectedId === row.id}
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
    error instanceof ConfigurationClientError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof ConfigurationClientError && error.status === 404;
}

function countByStatus(
  items: readonly { readonly status: string }[],
  status: string,
): number {
  return items.filter((item) => item.status === status).length;
}

const SECTION_META: Record<
  ConfigurationSection,
  { readonly title: string; readonly description: string }
> = {
  overview: {
    title: "Overview",
    description:
      "Configuration metadata dashboard — runtime resolution, feature flags, and secrets are not available.",
  },
  configurations: {
    title: "Configurations",
    description: "Canonical configuration metadata and lifecycle commands.",
  },
  namespaces: {
    title: "Namespaces",
    description:
      "Namespace metadata — not OS or Kubernetes namespaces.",
  },
  groups: {
    title: "Groups",
    description: "Group metadata within namespaces.",
  },
  versions: {
    title: "Versions",
    description: "Version metadata — published versions are immutable.",
  },
  overrides: {
    title: "Overrides",
    description: "Override metadata only — effective values are not resolved.",
  },
  scopes: {
    title: "Scopes",
    description: "Canonical scope hierarchy metadata (governance view).",
  },
  validation: {
    title: "Validation",
    description: "Declarative validation rules and metadata validation.",
  },
  references: {
    title: "References",
    description: "Cross-product reference metadata — no product queries.",
  },
  audit: {
    title: "Audit",
    description: "Read-only configuration audit timeline.",
  },
  diagnostics: {
    title: "Diagnostics",
    description:
      "Health, readiness, and capabilities — runtime features unavailable.",
  },
};

export function PlatformConfigurationView({
  section = "overview",
  canManage = true,
}: {
  readonly section?: ConfigurationSection;
  /** Server remains authoritative; UI may hide manage actions when false. */
  readonly canManage?: boolean;
}) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<
    string | null
  >(null);
  const [selectedNamespaceId, setSelectedNamespaceId] = useState<string | null>(
    null,
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  const [selectedOverrideId, setSelectedOverrideId] = useState<string | null>(
    null,
  );
  const [selectedScopeId, setSelectedScopeId] = useState<string | null>(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transitionTarget, setTransitionTarget] = useState("validated");
  const [apiMetadataOpen, setApiMetadataOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: configurationQueryKeys.list({
      status: statusFilter || undefined,
    }),
    queryFn: ({ signal }) =>
      listConfigurations(
        { status: statusFilter || undefined, limit: 100 },
        { signal },
      ),
  });

  const selectedId =
    selectedConfigurationId ?? listQuery.data?.items[0]?.id ?? null;

  const detailQuery = useQuery({
    queryKey: configurationQueryKeys.detail(selectedId ?? ""),
    queryFn: ({ signal }) => getConfiguration(selectedId!, { signal }),
    enabled: Boolean(selectedId),
  });

  const namespacesQuery = useQuery({
    queryKey: configurationQueryKeys.namespaces.list(),
    queryFn: ({ signal }) => listConfigurationNamespaces({ signal }),
    enabled:
      section === "namespaces" ||
      section === "overview" ||
      section === "diagnostics",
  });

  const namespaceId =
    selectedNamespaceId ?? namespacesQuery.data?.items[0]?.id ?? null;
  const namespaceDetailQuery = useQuery({
    queryKey: configurationQueryKeys.namespaces.detail(namespaceId ?? ""),
    queryFn: ({ signal }) => getConfigurationNamespace(namespaceId!, { signal }),
    enabled: Boolean(namespaceId) && section === "namespaces",
  });

  const groupsQuery = useQuery({
    queryKey: configurationQueryKeys.groups.list(),
    queryFn: ({ signal }) => listConfigurationGroups({ signal }),
    enabled: section === "groups" || section === "overview",
  });

  const groupId = selectedGroupId ?? groupsQuery.data?.items[0]?.id ?? null;

  const versionsQuery = useQuery({
    queryKey: configurationQueryKeys.versions(selectedId ?? ""),
    queryFn: ({ signal }) => listConfigurationVersions(selectedId!, { signal }),
    enabled:
      Boolean(selectedId) &&
      (section === "versions" || section === "configurations"),
  });

  const versionId =
    selectedVersionId ?? versionsQuery.data?.items[0]?.id ?? null;

  const overridesQuery = useQuery({
    queryKey: configurationQueryKeys.overrides(selectedId ?? ""),
    queryFn: ({ signal }) => listConfigurationOverrides(selectedId!, { signal }),
    enabled:
      Boolean(selectedId) &&
      (section === "overrides" || section === "configurations"),
  });

  const overrideId =
    selectedOverrideId ?? overridesQuery.data?.items[0]?.id ?? null;

  const scopesQuery = useQuery({
    queryKey: configurationQueryKeys.scopes.list(),
    queryFn: ({ signal }) => listConfigurationScopes({ signal }),
    enabled: section === "scopes" || section === "overview",
  });

  const scopeId =
    selectedScopeId ??
    scopesQuery.data?.items[0]?.configurationId ??
    null;
  const scopeDetailQuery = useQuery({
    queryKey: configurationQueryKeys.scopes.detail(scopeId ?? ""),
    queryFn: ({ signal }) => getConfigurationScope(scopeId!, { signal }),
    enabled: Boolean(scopeId) && section === "scopes",
  });

  const rulesQuery = useQuery({
    queryKey: configurationQueryKeys.validationRules(),
    queryFn: ({ signal }) => listConfigurationValidationRules({ signal }),
    enabled: section === "validation" || section === "overview",
  });

  const referencesQuery = useQuery({
    queryKey: configurationQueryKeys.references(selectedId ?? ""),
    queryFn: ({ signal }) =>
      listConfigurationReferences(selectedId!, { signal }),
    enabled:
      Boolean(selectedId) &&
      (section === "references" || section === "configurations"),
  });

  const referenceId =
    selectedReferenceId ?? referencesQuery.data?.items[0]?.id ?? null;
  const referenceDetailQuery = useQuery({
    queryKey: [...configurationQueryKeys.references(selectedId ?? ""), "detail", referenceId ?? ""],
    queryFn: ({ signal }) => getConfigurationReference(referenceId!, { signal }),
    enabled: Boolean(referenceId) && section === "references",
  });

  const auditQuery = useQuery({
    queryKey: configurationQueryKeys.audit.list(),
    queryFn: ({ signal }) => listConfigurationAudit(undefined, { signal }),
    enabled: section === "audit",
  });

  const scopedAuditQuery = useQuery({
    queryKey: configurationQueryKeys.audit.configuration(selectedId ?? ""),
    queryFn: ({ signal }) => listConfigurationAudit(selectedId!, { signal }),
    enabled: Boolean(selectedId) && section === "configurations",
  });

  const capabilitiesQuery = useQuery({
    queryKey: configurationQueryKeys.capabilities(),
    queryFn: ({ signal }) => getConfigurationCapabilities({ signal }),
    enabled:
      section === "overview" ||
      section === "diagnostics" ||
      apiMetadataOpen,
  });

  const healthQuery = useQuery({
    queryKey: configurationQueryKeys.health(),
    queryFn: ({ signal }) => getConfigurationHealth({ signal }),
    enabled: section === "overview" || section === "diagnostics",
  });

  const readinessQuery = useQuery({
    queryKey: configurationQueryKeys.readiness(),
    queryFn: ({ signal }) => getConfigurationReadiness({ signal }),
    enabled: section === "overview" || section === "diagnostics",
  });

  const diagnosticsQuery = useQuery({
    queryKey: configurationQueryKeys.diagnostics(),
    queryFn: ({ signal }) => getConfigurationDiagnostics({ signal }),
    enabled: section === "diagnostics",
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: configurationQueryKeys.all,
    });
  };

  const runAction = useMutation({
    mutationFn: async (action: string) => {
      if (!selectedId) throw new Error("Select a configuration first.");
      switch (action) {
        case "validate":
          return validateConfiguration(selectedId);
        case "approve":
          return approveConfiguration(selectedId);
        case "publish":
          return publishConfiguration(selectedId);
        case "deprecate":
          return deprecateConfiguration(selectedId);
        case "archive":
          return archiveConfiguration(selectedId);
        case "restore":
          return restoreConfiguration(selectedId);
        case "transition":
          return transitionConfiguration(selectedId, { to: transitionTarget });
        case "publish-version":
          if (!versionId) throw new Error("Select a version first.");
          return publishConfigurationVersion(selectedId, versionId);
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    },
    onSuccess: async (_data, action) => {
      setActionError(null);
      setStatusMessage(`Completed: ${action}`);
      await invalidateAll();
    },
    onError: (error) => {
      setStatusMessage(null);
      setActionError(toConfigurationUserMessage(error));
    },
  });

  const validateMetadataMutation = useMutation({
    mutationFn: () =>
      validateConfigurationMetadata({
        hierarchyLevel: detailQuery.data?.hierarchyLevel ?? "tenant",
        scope: detailQuery.data?.scope ?? { kind: "tenant" },
        status: detailQuery.data?.status,
        namespaceId: detailQuery.data?.namespaceId,
        groupId: detailQuery.data?.groupId,
      }),
    onSuccess: (result) => {
      setValidationResult(
        result.valid ? "Validation passed" : "Validation failed",
      );
      setActionError(null);
    },
    onError: (error) => {
      setValidationResult(null);
      setActionError(toConfigurationUserMessage(error));
    },
  });

  const meta = SECTION_META[section];
  const items = listQuery.data?.items ?? [];
  const selected = detailQuery.data;

  const toolbar = (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Configuration commands"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void invalidateAll()}
      >
        Refresh
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setApiMetadataOpen((open) => !open)}
      >
        Open API Metadata
      </Button>
      {selectedId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void copyText(selectedId)
              .then(() => setStatusMessage("Copied configuration ID"))
              .catch((error) =>
                setActionError(toConfigurationUserMessage(error)),
              );
          }}
        >
          Copy ID
        </Button>
      ) : null}
      {canManage &&
      (section === "configurations" || section === "versions") &&
      selectedId ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={runAction.isPending}
            onClick={() => runAction.mutate("validate")}
          >
            Validate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={runAction.isPending}
            onClick={() => runAction.mutate("approve")}
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={runAction.isPending}
            onClick={() => runAction.mutate("publish")}
          >
            Publish
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={runAction.isPending}
            onClick={() => runAction.mutate("deprecate")}
          >
            Deprecate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={runAction.isPending}
            onClick={() => runAction.mutate("archive")}
          >
            Archive
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={runAction.isPending}
            onClick={() => runAction.mutate("restore")}
          >
            Restore
          </Button>
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">Transition target</span>
            <Input
              aria-label="Transition target"
              value={transitionTarget}
              onChange={(event) => setTransitionTarget(event.target.value)}
              className="h-8 w-32"
            />
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={runAction.isPending}
            onClick={() => runAction.mutate("transition")}
          >
            Transition
          </Button>
        </>
      ) : null}
    </div>
  );

  if (listQuery.isError && isForbidden(listQuery.error)) {
    return (
      <PageShell title={meta.title} description={meta.description}>
        <ErrorState
          forbidden
          message={toConfigurationUserMessage(listQuery.error)}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={meta.title}
      description={meta.description}
      actions={toolbar}
    >
      {statusMessage ? (
        <p
          className="text-sm text-[var(--color-foreground)]"
          data-testid="configuration-status"
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}
      {actionError ? (
        <p
          className="text-sm text-[var(--color-destructive)]"
          data-testid="configuration-action-error"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}

      {section === "overview" ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              label="Runtime resolution"
              value={RUNTIME_BANNER}
              testId="card-runtime-status"
              emphasize
            />
            <StatusCard
              label="Feature flags"
              value={FLAGS_BANNER}
              testId="card-flags-status"
              emphasize
            />
            <StatusCard
              label="Secret management"
              value={SECRETS_BANNER}
              testId="card-secrets-status"
              emphasize
            />
            <StatusCard
              label="Hot reload"
              value={HOT_RELOAD_BANNER}
              testId="card-hot-reload-status"
              emphasize
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              label="Total configurations"
              value={String(items.length)}
              testId="card-configurations-count"
            />
            <StatusCard
              label="Draft"
              value={String(countByStatus(items, "draft"))}
              testId="card-draft-count"
            />
            <StatusCard
              label="Published"
              value={String(countByStatus(items, "published"))}
              testId="card-published-count"
            />
            <StatusCard
              label="Archived"
              value={String(countByStatus(items, "archived"))}
              testId="card-archived-count"
            />
            <StatusCard
              label="Validated"
              value={String(countByStatus(items, "validated"))}
            />
            <StatusCard
              label="Approved"
              value={String(countByStatus(items, "approved"))}
            />
            <StatusCard
              label="Deprecated"
              value={String(countByStatus(items, "deprecated"))}
            />
            <StatusCard
              label="Namespaces"
              value={String(namespacesQuery.data?.items.length ?? 0)}
              testId="card-namespaces-count"
            />
            <StatusCard
              label="Groups"
              value={String(groupsQuery.data?.items.length ?? 0)}
              testId="card-groups-count"
            />
            <StatusCard
              label="Validation rules"
              value={String(rulesQuery.data?.items.length ?? 0)}
            />
            <StatusCard
              label="Service enabled"
              value={
                capabilitiesQuery.data?.configurationEnabled
                  ? "Ready"
                  : "Unavailable"
              }
              testId="card-service-status"
            />
            <StatusCard
              label="Management plane"
              value={
                capabilitiesQuery.data?.managementPlaneReady
                  ? "Ready"
                  : "Unavailable"
              }
            />
          </div>
          {listQuery.isLoading ? (
            <p role="status">Loading configurations…</p>
          ) : null}
          {listQuery.isError ? (
            <ErrorState
              message={toConfigurationUserMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
            />
          ) : null}
        </div>
      ) : null}

      {section === "configurations" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span>Lifecycle filter</span>
              <Input
                aria-label="Lifecycle filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                placeholder="draft | published | …"
              />
            </label>
            {listQuery.isLoading ? (
              <p role="status">Loading…</p>
            ) : items.length === 0 ? (
              <EmptyState title="No configurations" />
            ) : (
              <MetaTable
                caption="Configurations"
                columns={["ID", "Key", "Status", "Scope"]}
                selectedId={selectedId}
                onRowClick={setSelectedConfigurationId}
                rows={items.map((item) => ({
                  id: item.id,
                  cells: [
                    item.id,
                    item.keyId,
                    item.status,
                    item.scope.kind,
                  ],
                }))}
              />
            )}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Details</h2>
            {detailQuery.isLoading ? (
              <p role="status">Loading detail…</p>
            ) : detailQuery.isError ? (
              <ErrorState
                message={toConfigurationUserMessage(detailQuery.error)}
                forbidden={isForbidden(detailQuery.error)}
                notFound={isNotFound(detailQuery.error)}
              />
            ) : selected ? (
              <dl className="grid gap-2 text-sm" data-testid="configuration-detail">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                  <dd>{selected.id}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Key</dt>
                  <dd>{selected.keyId}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Lifecycle
                  </dt>
                  <dd>{selected.status}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Namespace
                  </dt>
                  <dd>{selected.namespaceId}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Scope</dt>
                  <dd>{selected.scope.kind}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Hierarchy
                  </dt>
                  <dd>{selected.hierarchyLevel}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Revision
                  </dt>
                  <dd>{selected.revision}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Value presentation
                  </dt>
                  <dd data-testid="value-hidden-notice">{VALUE_HIDDEN}</dd>
                </div>
                {selected.status === "published" ? (
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Version policy
                    </dt>
                    <dd data-testid="immutable-notice">{IMMUTABLE_NOTICE}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <EmptyState title="Select a configuration" />
            )}
            {scopedAuditQuery.data?.items.length ? (
              <div>
                <h3 className="mb-2 text-sm font-medium">Audit summary</h3>
                <ul className="space-y-1 text-sm">
                  {scopedAuditQuery.data.items.slice(0, 5).map((entry) => (
                    <li key={entry.id}>
                      {entry.action} — {entry.createdAt}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {section === "namespaces" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {namespacesQuery.isLoading ? (
            <p role="status">Loading namespaces…</p>
          ) : (namespacesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No namespaces" />
          ) : (
            <MetaTable
              caption="Namespaces"
              columns={["ID", "Key", "Name"]}
              selectedId={namespaceId}
              onRowClick={setSelectedNamespaceId}
              rows={(namespacesQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [item.id, item.key, item.name],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Namespace detail</h2>
            {namespaceDetailQuery.data ? (
              <dl className="grid gap-2 text-sm">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                  <dd>{namespaceDetailQuery.data.name}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Key</dt>
                  <dd>{namespaceDetailQuery.data.key}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Tenant</dt>
                  <dd>{namespaceDetailQuery.data.tenantId}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="Select a namespace" />
            )}
          </div>
        </div>
      ) : null}

      {section === "groups" ? (
        <div>
          {groupsQuery.isLoading ? (
            <p role="status">Loading groups…</p>
          ) : (groupsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No groups" />
          ) : (
            <MetaTable
              caption="Groups"
              columns={["ID", "Namespace", "Key", "Name"]}
              selectedId={groupId}
              onRowClick={setSelectedGroupId}
              rows={(groupsQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [item.id, item.namespaceId, item.key, item.name],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "versions" ? (
        <div className="flex flex-col gap-3">
          {!selectedId ? (
            <EmptyState
              title="Select a configuration first"
              description="Open Configurations, select a row, then return to Versions."
            />
          ) : versionsQuery.isLoading ? (
            <p role="status">Loading versions…</p>
          ) : (versionsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No versions" />
          ) : (
            <>
              <MetaTable
                caption="Versions"
                columns={["ID", "Number", "Immutable", "Current"]}
                selectedId={versionId}
                onRowClick={setSelectedVersionId}
                rows={(versionsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [
                    item.id,
                    String(item.versionNumber),
                    item.immutable ? "yes" : "no",
                    item.isCurrent ? "yes" : "no",
                  ],
                }))}
              />
              {versionsQuery.data?.items.find((v) => v.id === versionId)
                ?.immutable ? (
                <p
                  className="text-sm font-medium"
                  data-testid="immutable-version-banner"
                >
                  {IMMUTABLE_NOTICE}
                </p>
              ) : null}
              {canManage && versionId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={runAction.isPending}
                  onClick={() => runAction.mutate("publish-version")}
                >
                  Publish Version
                </Button>
              ) : null}
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Version comparison is deferred — APIs do not expose a safe
                diff payload in this milestone.
              </p>
            </>
          )}
        </div>
      ) : null}

      {section === "overrides" ? (
        <div className="flex flex-col gap-3">
          <p
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-3 py-2 text-sm"
            data-testid="override-metadata-notice"
          >
            {OVERRIDE_NOTICE}
          </p>
          {!selectedId ? (
            <EmptyState title="Select a configuration first" />
          ) : overridesQuery.isLoading ? (
            <p role="status">Loading overrides…</p>
          ) : (overridesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No overrides" />
          ) : (
            <MetaTable
              caption="Overrides"
              columns={["ID", "Hierarchy", "Scope", "Precedence"]}
              selectedId={overrideId}
              onRowClick={setSelectedOverrideId}
              rows={(overridesQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [
                  item.id,
                  item.hierarchyLevel,
                  item.scope.kind,
                  String(item.precedenceRank),
                ],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "scopes" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {scopesQuery.isLoading ? (
            <p role="status">Loading scopes…</p>
          ) : (scopesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No scopes" />
          ) : (
            <MetaTable
              caption="Scopes"
              columns={["Configuration", "Scope kind"]}
              selectedId={scopeId}
              onRowClick={setSelectedScopeId}
              rows={(scopesQuery.data?.items ?? []).map((item) => ({
                id: item.configurationId,
                cells: [item.configurationId, item.scopeKind],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Hierarchy (read-only)</h2>
            <ol
              className="list-decimal space-y-1 pl-5 text-sm"
              data-testid="hierarchy-list"
            >
              {[
                "global",
                "tenant",
                "organisation",
                "product",
                "environment",
                "user",
              ].map((level) => (
                <li key={level}>
                  {level}
                  {scopeDetailQuery.data?.scopeKind === level
                    ? " — selected"
                    : ""}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
              Governance visualisation only — effective values are not resolved.
            </p>
          </div>
        </div>
      ) : null}

      {section === "validation" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={validateMetadataMutation.isPending}
              onClick={() => validateMetadataMutation.mutate()}
            >
              Validate metadata
            </Button>
            {validationResult ? (
              <p role="status" data-testid="validation-result">
                {validationResult}
              </p>
            ) : null}
          </div>
          {rulesQuery.isLoading ? (
            <p role="status">Loading rules…</p>
          ) : (
            <MetaTable
              caption="Validation rules"
              columns={["Kind", "Description"]}
              rows={(rulesQuery.data?.items ?? []).map((rule, index) => ({
                id: `${rule.kind}-${index}`,
                cells: [rule.kind, rule.description ?? "—"],
              }))}
            />
          )}
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Validation is declarative metadata only — custom validators are not
            executed in the Workbench.
          </p>
        </div>
      ) : null}

      {section === "references" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {!selectedId ? (
            <EmptyState title="Select a configuration first" />
          ) : referencesQuery.isLoading ? (
            <p role="status">Loading references…</p>
          ) : (referencesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No references" />
          ) : (
            <MetaTable
              caption="References"
              columns={["ID", "Product", "Resource"]}
              selectedId={referenceId}
              onRowClick={setSelectedReferenceId}
              rows={(referencesQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [item.id, item.kind, item.resourceId],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Reference detail</h2>
            {referenceDetailQuery.data ? (
              <dl className="grid gap-2 text-sm">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Product
                  </dt>
                  <dd>{referenceDetailQuery.data.kind}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Resource ID
                  </dt>
                  <dd>{referenceDetailQuery.data.resourceId}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="Select a reference" />
            )}
          </div>
        </div>
      ) : null}

      {section === "audit" ? (
        <div>
          {auditQuery.isLoading ? (
            <p role="status">Loading audit…</p>
          ) : (auditQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No audit entries" />
          ) : (
            <MetaTable
              caption="Audit timeline"
              testId="configuration-audit-table"
              columns={["Time", "Action", "Actor", "Configuration"]}
              rows={(auditQuery.data?.items ?? []).map((entry) => ({
                id: entry.id,
                cells: [
                  entry.createdAt,
                  entry.action,
                  entry.actorUserId,
                  entry.configurationId,
                ],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "diagnostics" ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatusCard
              label="Runtime Resolution"
              value="Unavailable"
              testId="diag-runtime"
              emphasize
            />
            <StatusCard
              label="Runtime Application"
              value="Unavailable"
              emphasize
            />
            <StatusCard
              label="Feature Flags"
              value="Unavailable"
              testId="diag-flags"
              emphasize
            />
            <StatusCard
              label="Secret Management"
              value="Unavailable"
              testId="diag-secrets"
              emphasize
            />
            <StatusCard label="Environment Injection" value="Unavailable" />
            <StatusCard label="Kubernetes Integration" value="Unavailable" />
            <StatusCard
              label="Hot Reload"
              value="Unavailable"
              testId="diag-hot-reload"
              emphasize
            />
            <StatusCard label="Event Bus" value="Unavailable" testId="diag-event-bus" />
            <StatusCard
              label="Configuration enabled"
              value={
                capabilitiesQuery.data?.configurationEnabled ? "Yes" : "No"
              }
            />
          </div>
          {healthQuery.data ? (
            <pre
              className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs"
              data-testid="diagnostics-health"
            >
              {JSON.stringify(healthQuery.data, null, 2)}
            </pre>
          ) : null}
          {readinessQuery.data ? (
            <pre className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs">
              {JSON.stringify(readinessQuery.data, null, 2)}
            </pre>
          ) : null}
          {diagnosticsQuery.data ? (
            <pre className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs">
              {JSON.stringify(diagnosticsQuery.data, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}

      {apiMetadataOpen ? (
        <aside
          className="rounded-lg border border-[var(--color-border)] p-3"
          data-testid="api-metadata-panel"
        >
          <h2 className="mb-2 text-sm font-medium">API metadata</h2>
          <pre className="overflow-x-auto text-xs">
            {JSON.stringify(capabilitiesQuery.data ?? {}, null, 2)}
          </pre>
        </aside>
      ) : null}
    </PageShell>
  );
}
