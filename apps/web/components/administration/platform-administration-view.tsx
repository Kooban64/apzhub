"use client";

/**
 * Platform Administration Workbench (APZADMIN-004).
 * Consumes only administration typed-client facades — no gateway/core/persistence.
 * Management plane only — runtime administration, users, roles, tenants unavailable.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import {
  archiveModule,
  getAction,
  getCapability,
  getCategory,
  getDashboard,
  getDiagnostic,
  getDiagnostics,
  getHealth,
  getManagementCapabilities,
  getModule,
  getNavigation,
  getPermission,
  getPolicy,
  getReadiness,
  getReference,
  getRegistration,
  getSection,
  getShortcut,
  getWidget,
  listActions,
  listAudit,
  listCapabilities,
  listCategories,
  listDashboards,
  listModules,
  listModuleHistory,
  listNavigations,
  listPermissions,
  listPolicies,
  listReferences,
  listRegistrations,
  listSections,
  listShortcuts,
  listWidgets,
  restoreModule,
  transitionModule,
} from "@/lib/administration/administration-api";
import {
  AdministrationClientError,
  toAdministrationUserMessage,
} from "@/lib/administration/administration-errors";
import { administrationQueryKeys } from "@/lib/administration/query-keys";
import type { AdministrationSection } from "@/lib/administration/routes";

const METADATA_BANNER =
  "ADMINISTRATION METADATA ONLY — RUNTIME ADMINISTRATION IS NOT AVAILABLE";
const REGISTRATION_BANNER =
  "REGISTRATION METADATA ONLY — NO SERVICE PROVISIONING";
const ACTION_BANNER =
  "ACTION CATALOGUE ONLY — RUNTIME EXECUTION IS NOT AVAILABLE";
const PERMISSION_BANNER =
  "PERMISSION CATALOGUE — ACCESS ASSIGNMENT IS OUTSIDE THIS MILESTONE";
const DASHBOARD_BANNER =
  "DASHBOARD METADATA ONLY — ANALYTICS RENDERING IS NOT PART OF ADMINISTRATION";
const HEALTH_BANNER = "REGISTERED HEALTH METADATA — NO LIVE PROBE";

/** Canonical product workspace routes — never fetch other products. */
const CANONICAL_PRODUCT_ROUTES: Readonly<Record<string, string>> = {
  configuration: "/workspace/configuration",
  notifications: "/workspace/notifications",
  search: "/workspace/search",
  support: "/workspace/support",
  documents: "/workspace/documents",
  reporting: "/workspace/reporting",
  workflows: "/workspace/workflows",
  testing: "/workspace/testing",
  administration: "/workspace/administration",
};

const UNAVAILABLE_CAPABILITIES = [
  "Runtime Administration",
  "User Management",
  "Role Management",
  "Tenant Management",
  "Organisation Management",
  "Provisioning",
  "Live Infrastructure Diagnostics",
  "Event Bus",
  "AI Administration",
] as const;

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
    <div className="flex flex-col gap-6 p-1" data-testid="administration-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Administration
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
      data-testid="administration-empty"
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
          ? "administration-forbidden"
          : notFound
            ? "administration-not-found"
            : "administration-error"
      }
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {forbidden
          ? "Access denied"
          : notFound
            ? "Not found"
            : "Unable to load administration"}
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
  testId = "administration-table",
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

function NoticeBanner({
  text,
  testId,
}: {
  readonly text: string;
  readonly testId?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-muted)]/40 px-4 py-3 text-sm font-medium"
      data-testid={testId}
      role="status"
    >
      {text}
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
    error instanceof AdministrationClientError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof AdministrationClientError && error.status === 404;
}

function countByStatus(
  items: readonly { readonly status: string }[],
  status: string,
): number {
  return items.filter((item) => item.status === status).length;
}

function filterByText<T extends Record<string, unknown>>(
  items: readonly T[],
  query: string,
  fields: readonly (keyof T)[],
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? "").toLowerCase().includes(q)),
  );
}

const SECTION_META: Record<
  AdministrationSection,
  { readonly title: string; readonly description: string }
> = {
  overview: {
    title: "Overview",
    description:
      "Administration metadata dashboard — runtime administration is not available.",
  },
  modules: {
    title: "Modules",
    description: "Registered module metadata and lifecycle commands.",
  },
  categories: {
    title: "Categories",
    description: "Administration category catalogue metadata.",
  },
  sections: {
    title: "Sections",
    description: "Section catalogue within categories.",
  },
  registrations: {
    title: "Registrations",
    description: "Module registration metadata — no provisioning.",
  },
  capabilities: {
    title: "Capabilities",
    description: "Capability catalogue metadata and readiness flags.",
  },
  actions: {
    title: "Actions",
    description: "Action catalogue — runtime execution is not available.",
  },
  permissions: {
    title: "Permissions",
    description: "Permission catalogue — assignment is outside this milestone.",
  },
  policies: {
    title: "Policies",
    description: "Policy catalogue metadata.",
  },
  navigation: {
    title: "Navigation",
    description: "Navigation metadata for workbench surfaces.",
  },
  shortcuts: {
    title: "Shortcuts",
    description: "Shortcut metadata linked to catalogue actions.",
  },
  dashboards: {
    title: "Dashboards",
    description: "Dashboard metadata — analytics rendering is not available.",
  },
  widgets: {
    title: "Widgets",
    description: "Widget metadata for registered dashboards.",
  },
  references: {
    title: "References",
    description: "Cross-product reference metadata — no product queries.",
  },
  audit: {
    title: "Audit",
    description: "Read-only administration audit timeline.",
  },
  history: {
    title: "History",
    description: "Module history metadata.",
  },
  diagnostics: {
    title: "Diagnostics",
    description:
      "Management-plane health and capabilities — live probes unavailable.",
  },
};

export function PlatformAdministrationView({
  section = "overview",
  canManage = true,
}: {
  readonly section?: AdministrationSection;
  /** Server remains authoritative; UI may hide manage actions when false. */
  readonly canManage?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<
    string | null
  >(null);
  const [selectedCapabilityId, setSelectedCapabilityId] = useState<
    string | null
  >(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedPermissionId, setSelectedPermissionId] = useState<
    string | null
  >(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [selectedNavigationId, setSelectedNavigationId] = useState<
    string | null
  >(null);
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(
    null,
  );
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(
    null,
  );
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transitionTarget, setTransitionTarget] = useState("enabled");
  const [apiMetadataOpen, setApiMetadataOpen] = useState(false);

  const modulesQuery = useQuery({
    queryKey: administrationQueryKeys.modules.list({
      status: statusFilter || undefined,
    }),
    queryFn: ({ signal }) =>
      listModules(
        { status: statusFilter || undefined, limit: 100 },
        { signal },
      ),
  });

  const moduleId =
    selectedModuleId ?? modulesQuery.data?.items[0]?.id ?? null;

  const moduleDetailQuery = useQuery({
    queryKey: administrationQueryKeys.modules.detail(moduleId ?? ""),
    queryFn: ({ signal }) => getModule(moduleId!, { signal }),
    enabled: Boolean(moduleId),
  });

  const categoriesQuery = useQuery({
    queryKey: administrationQueryKeys.categories.list(),
    queryFn: ({ signal }) => listCategories({ signal }),
    enabled:
      section === "categories" ||
      section === "overview" ||
      section === "sections",
  });

  const categoryId =
    selectedCategoryId ?? categoriesQuery.data?.items[0]?.id ?? null;
  const categoryDetailQuery = useQuery({
    queryKey: administrationQueryKeys.categories.detail(categoryId ?? ""),
    queryFn: ({ signal }) => getCategory(categoryId!, { signal }),
    enabled: Boolean(categoryId) && section === "categories",
  });

  const sectionsQuery = useQuery({
    queryKey: administrationQueryKeys.sections.list(),
    queryFn: ({ signal }) => listSections({ signal }),
    enabled: section === "sections" || section === "overview",
  });

  const sectionId =
    selectedSectionId ?? sectionsQuery.data?.items[0]?.id ?? null;
  const sectionDetailQuery = useQuery({
    queryKey: administrationQueryKeys.sections.detail(sectionId ?? ""),
    queryFn: ({ signal }) => getSection(sectionId!, { signal }),
    enabled: Boolean(sectionId) && section === "sections",
  });

  const registrationsQuery = useQuery({
    queryKey: administrationQueryKeys.registrations.list(),
    queryFn: ({ signal }) => listRegistrations({ signal }),
    enabled: section === "registrations" || section === "overview",
  });

  const registrationId =
    selectedRegistrationId ?? registrationsQuery.data?.items[0]?.id ?? null;
  const registrationDetailQuery = useQuery({
    queryKey: administrationQueryKeys.registrations.detail(
      registrationId ?? "",
    ),
    queryFn: ({ signal }) => getRegistration(registrationId!, { signal }),
    enabled: Boolean(registrationId) && section === "registrations",
  });

  const capabilitiesQuery = useQuery({
    queryKey: administrationQueryKeys.capabilities.list(),
    queryFn: ({ signal }) => listCapabilities({ signal }),
    enabled:
      section === "capabilities" ||
      section === "overview" ||
      section === "diagnostics" ||
      section === "modules",
  });

  const capabilityId =
    selectedCapabilityId ?? capabilitiesQuery.data?.items[0]?.id ?? null;
  const capabilityDetailQuery = useQuery({
    queryKey: administrationQueryKeys.capabilities.detail(capabilityId ?? ""),
    queryFn: ({ signal }) => getCapability(capabilityId!, { signal }),
    enabled: Boolean(capabilityId) && section === "capabilities",
  });

  const actionsQuery = useQuery({
    queryKey: administrationQueryKeys.actions.list(),
    queryFn: ({ signal }) => listActions({ signal }),
    enabled: section === "actions" || section === "overview",
  });

  const actionId = selectedActionId ?? actionsQuery.data?.items[0]?.id ?? null;
  const actionDetailQuery = useQuery({
    queryKey: administrationQueryKeys.actions.detail(actionId ?? ""),
    queryFn: ({ signal }) => getAction(actionId!, { signal }),
    enabled: Boolean(actionId) && section === "actions",
  });

  const permissionsQuery = useQuery({
    queryKey: administrationQueryKeys.permissions.list(),
    queryFn: ({ signal }) => listPermissions({ signal }),
    enabled: section === "permissions" || section === "overview",
  });

  const permissionId =
    selectedPermissionId ?? permissionsQuery.data?.items[0]?.id ?? null;
  const permissionDetailQuery = useQuery({
    queryKey: administrationQueryKeys.permissions.detail(permissionId ?? ""),
    queryFn: ({ signal }) => getPermission(permissionId!, { signal }),
    enabled: Boolean(permissionId) && section === "permissions",
  });

  const policiesQuery = useQuery({
    queryKey: administrationQueryKeys.policies.list(),
    queryFn: ({ signal }) => listPolicies({ signal }),
    enabled: section === "policies" || section === "overview",
  });

  const policyId = selectedPolicyId ?? policiesQuery.data?.items[0]?.id ?? null;
  const policyDetailQuery = useQuery({
    queryKey: administrationQueryKeys.policies.detail(policyId ?? ""),
    queryFn: ({ signal }) => getPolicy(policyId!, { signal }),
    enabled: Boolean(policyId) && section === "policies",
  });

  const navigationsQuery = useQuery({
    queryKey: administrationQueryKeys.navigations.list(),
    queryFn: ({ signal }) => listNavigations({ signal }),
    enabled: section === "navigation" || section === "overview",
  });

  const navigationId =
    selectedNavigationId ?? navigationsQuery.data?.items[0]?.id ?? null;
  const navigationDetailQuery = useQuery({
    queryKey: administrationQueryKeys.navigations.detail(navigationId ?? ""),
    queryFn: ({ signal }) => getNavigation(navigationId!, { signal }),
    enabled: Boolean(navigationId) && section === "navigation",
  });

  const shortcutsQuery = useQuery({
    queryKey: administrationQueryKeys.shortcuts.list(),
    queryFn: ({ signal }) => listShortcuts({ signal }),
    enabled: section === "shortcuts",
  });

  const shortcutId =
    selectedShortcutId ?? shortcutsQuery.data?.items[0]?.id ?? null;
  const shortcutDetailQuery = useQuery({
    queryKey: administrationQueryKeys.shortcuts.detail(shortcutId ?? ""),
    queryFn: ({ signal }) => getShortcut(shortcutId!, { signal }),
    enabled: Boolean(shortcutId) && section === "shortcuts",
  });

  const dashboardsQuery = useQuery({
    queryKey: administrationQueryKeys.dashboards.list(),
    queryFn: ({ signal }) => listDashboards({ signal }),
    enabled:
      section === "dashboards" ||
      section === "widgets" ||
      section === "overview",
  });

  const dashboardId =
    selectedDashboardId ?? dashboardsQuery.data?.items[0]?.id ?? null;
  const dashboardDetailQuery = useQuery({
    queryKey: administrationQueryKeys.dashboards.detail(dashboardId ?? ""),
    queryFn: ({ signal }) => getDashboard(dashboardId!, { signal }),
    enabled: Boolean(dashboardId) && section === "dashboards",
  });

  const widgetsQuery = useQuery({
    queryKey: administrationQueryKeys.widgets.list(dashboardId ?? ""),
    queryFn: ({ signal }) => listWidgets(dashboardId!, { signal }),
    enabled: Boolean(dashboardId) && (section === "widgets" || section === "dashboards"),
  });

  const widgetId = selectedWidgetId ?? widgetsQuery.data?.items[0]?.id ?? null;
  const widgetDetailQuery = useQuery({
    queryKey: administrationQueryKeys.widgets.detail(widgetId ?? ""),
    queryFn: ({ signal }) => getWidget(widgetId!, { signal }),
    enabled: Boolean(widgetId) && section === "widgets",
  });

  const referencesQuery = useQuery({
    queryKey: administrationQueryKeys.references.list(moduleId ?? ""),
    queryFn: ({ signal }) => listReferences(moduleId!, { signal }),
    enabled: Boolean(moduleId) && (section === "references" || section === "modules"),
  });

  const referenceId =
    selectedReferenceId ?? referencesQuery.data?.items[0]?.id ?? null;
  const referenceDetailQuery = useQuery({
    queryKey: administrationQueryKeys.references.detail(referenceId ?? ""),
    queryFn: ({ signal }) => getReference(referenceId!, { signal }),
    enabled: Boolean(referenceId) && section === "references",
  });

  const auditQuery = useQuery({
    queryKey: administrationQueryKeys.audit.list(),
    queryFn: ({ signal }) => listAudit(undefined, { signal }),
    enabled: section === "audit",
  });

  const historyQuery = useQuery({
    queryKey: administrationQueryKeys.modules.history(moduleId ?? ""),
    queryFn: ({ signal }) => listModuleHistory(moduleId!, { signal }),
    enabled: Boolean(moduleId) && (section === "history" || section === "modules"),
  });

  const managementCapsQuery = useQuery({
    queryKey: administrationQueryKeys.managementCapabilities(),
    queryFn: ({ signal }) => getManagementCapabilities({ signal }),
    enabled:
      section === "overview" ||
      section === "diagnostics" ||
      apiMetadataOpen,
  });

  const healthQuery = useQuery({
    queryKey: administrationQueryKeys.health(),
    queryFn: ({ signal }) => getHealth({ signal }),
    enabled: section === "overview" || section === "diagnostics",
  });

  const readinessQuery = useQuery({
    queryKey: administrationQueryKeys.readiness(),
    queryFn: ({ signal }) => getReadiness({ signal }),
    enabled: section === "overview" || section === "diagnostics",
  });

  const diagnosticsQuery = useQuery({
    queryKey: administrationQueryKeys.diagnostics.list(),
    queryFn: ({ signal }) => getDiagnostics({ signal }),
    enabled: section === "diagnostics",
  });

  const diagnosticDetailQuery = useQuery({
    queryKey: administrationQueryKeys.diagnostics.detail("diag_mock_1"),
    queryFn: ({ signal }) => getDiagnostic("diag_mock_1", { signal }),
    enabled: section === "diagnostics",
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: administrationQueryKeys.all,
    });
  };

  const runAction = useMutation({
    mutationFn: async (action: string) => {
      if (!moduleId) throw new Error("Select a module first.");
      switch (action) {
        case "archive":
          return archiveModule(moduleId);
        case "restore":
          return restoreModule(moduleId);
        case "transition":
          return transitionModule(moduleId, { to: transitionTarget });
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
      setActionError(toAdministrationUserMessage(error));
    },
  });

  const meta = SECTION_META[section];
  const modules = modulesQuery.data?.items ?? [];
  const selectedModule = moduleDetailQuery.data;

  const filteredModules = useMemo(
    () =>
      filterByText(modules, textFilter, ["id", "key", "name", "status"]).sort(
        (a, b) => a.name.localeCompare(b.name),
      ),
    [modules, textFilter],
  );

  const openProduct = (key: string) => {
    const route = CANONICAL_PRODUCT_ROUTES[key];
    if (!route) {
      setActionError(
        "No canonical product route is registered for this module key.",
      );
      return;
    }
    router.push(route);
  };

  const openDocumentation = (doc?: string) => {
    if (!doc) {
      setActionError("No documentation reference is available.");
      return;
    }
    if (doc.startsWith("/")) {
      router.push(doc);
      return;
    }
    setStatusMessage(`Documentation reference: ${doc}`);
  };

  const toolbar = (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Administration commands"
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
      {moduleId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void copyText(moduleId)
              .then(() => setStatusMessage("Copied module ID"))
              .catch((error) =>
                setActionError(toAdministrationUserMessage(error)),
              );
          }}
        >
          Copy ID
        </Button>
      ) : null}
      {section === "modules" && selectedModule ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openProduct(selectedModule.key)}
          >
            Open Product
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              openDocumentation(
                capabilityDetailQuery.data?.documentation ??
                  capabilitiesQuery.data?.items.find(
                    (item) => item.moduleId === selectedModule.id,
                  )?.documentation,
              )
            }
          >
            Open Documentation
          </Button>
        </>
      ) : null}
      {canManage && section === "modules" && moduleId ? (
        <>
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

  if (modulesQuery.isError && isForbidden(modulesQuery.error)) {
    return (
      <PageShell title={meta.title} description={meta.description}>
        <ErrorState
          forbidden
          message={toAdministrationUserMessage(modulesQuery.error)}
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
          data-testid="administration-status"
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}
      {actionError ? (
        <p
          className="text-sm text-[var(--color-destructive)]"
          data-testid="administration-action-error"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}

      {apiMetadataOpen ? (
        <div
          className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm"
          data-testid="api-metadata-panel"
        >
          <p className="font-medium">API metadata</p>
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            Management plane ready:{" "}
            {managementCapsQuery.data?.managementPlaneReady ? "yes" : "no"}
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            Runtime admin enabled:{" "}
            {managementCapsQuery.data?.runtimeAdminEnabled ? "yes" : "no"}
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            Workbench enabled:{" "}
            {managementCapsQuery.data?.workbenchEnabled ? "yes" : "no"}
          </p>
        </div>
      ) : null}

      {section === "overview" ? (
        <div className="flex flex-col gap-4">
          <NoticeBanner text={METADATA_BANNER} testId="banner-metadata" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UNAVAILABLE_CAPABILITIES.map((label) => (
              <StatusCard
                key={label}
                label={label}
                value="Unavailable"
                testId={`card-unavailable-${label.toLowerCase().replace(/\s+/g, "-")}`}
                emphasize
              />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              label="Modules"
              value={String(modules.length)}
              testId="card-modules-count"
            />
            <StatusCard
              label="Registered"
              value={String(countByStatus(modules, "registered"))}
              testId="card-registered-count"
            />
            <StatusCard
              label="Enabled"
              value={String(countByStatus(modules, "enabled"))}
            />
            <StatusCard
              label="Archived"
              value={String(countByStatus(modules, "archived"))}
            />
            <StatusCard
              label="Categories"
              value={String(categoriesQuery.data?.items.length ?? 0)}
              testId="card-categories-count"
            />
            <StatusCard
              label="Capabilities"
              value={String(capabilitiesQuery.data?.items.length ?? 0)}
              testId="card-capabilities-count"
            />
            <StatusCard
              label="Permissions"
              value={String(permissionsQuery.data?.items.length ?? 0)}
            />
            <StatusCard
              label="Registrations"
              value={String(registrationsQuery.data?.items.length ?? 0)}
            />
            <StatusCard
              label="Service enabled"
              value={
                managementCapsQuery.data?.administrationEnabled
                  ? "Ready"
                  : "Unavailable"
              }
              testId="card-service-status"
            />
            <StatusCard
              label="Management plane"
              value={
                managementCapsQuery.data?.managementPlaneReady
                  ? "Ready"
                  : "Unavailable"
              }
            />
            <StatusCard
              label="Health metadata"
              value={HEALTH_BANNER}
              testId="card-health-metadata"
              emphasize
            />
            <StatusCard
              label="Health status"
              value={String(
                (healthQuery.data as { status?: string } | undefined)?.status ??
                  "unknown",
              )}
            />
          </div>
          {modulesQuery.isLoading ? (
            <p role="status">Loading modules…</p>
          ) : null}
          {modulesQuery.isError ? (
            <ErrorState
              message={toAdministrationUserMessage(modulesQuery.error)}
              onRetry={() => void modulesQuery.refetch()}
            />
          ) : null}
        </div>
      ) : null}

      {section === "modules" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <NoticeBanner text={METADATA_BANNER} testId="banner-metadata" />
            <label className="flex flex-col gap-1 text-sm">
              <span>Status filter</span>
              <Input
                aria-label="Status filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                placeholder="registered | enabled | …"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Search</span>
              <Input
                aria-label="Module search"
                value={textFilter}
                onChange={(event) => setTextFilter(event.target.value)}
                placeholder="Filter by key, name, id…"
              />
            </label>
            {modulesQuery.isLoading ? (
              <p role="status">Loading…</p>
            ) : filteredModules.length === 0 ? (
              <EmptyState title="No modules" />
            ) : (
              <MetaTable
                caption="Modules"
                columns={["ID", "Key", "Name", "Status"]}
                selectedId={moduleId}
                onRowClick={setSelectedModuleId}
                rows={filteredModules.map((item) => ({
                  id: item.id,
                  cells: [item.id, item.key, item.name, item.status],
                }))}
              />
            )}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Details</h2>
            {moduleDetailQuery.isLoading ? (
              <p role="status">Loading detail…</p>
            ) : moduleDetailQuery.isError ? (
              <ErrorState
                message={toAdministrationUserMessage(moduleDetailQuery.error)}
                forbidden={isForbidden(moduleDetailQuery.error)}
                notFound={isNotFound(moduleDetailQuery.error)}
              />
            ) : selectedModule ? (
              <dl
                className="grid gap-2 text-sm"
                data-testid="administration-module-detail"
              >
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                  <dd>{selectedModule.id}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Key</dt>
                  <dd>{selectedModule.key}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                  <dd>{selectedModule.name}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Status
                  </dt>
                  <dd data-testid="module-status">{selectedModule.status}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Revision
                  </dt>
                  <dd>{selectedModule.revision}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Description
                  </dt>
                  <dd>{selectedModule.description ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Status model
                  </dt>
                  <dd data-testid="module-status-model">
                    Registered · Enabled · Available · Healthy Metadata ·
                    Certified · Production Ready
                  </dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="Select a module" />
            )}
          </div>
        </div>
      ) : null}

      {section === "categories" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {categoriesQuery.isLoading ? (
            <p role="status">Loading categories…</p>
          ) : (categoriesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No categories" />
          ) : (
            <MetaTable
              caption="Categories"
              columns={["ID", "Key", "Name", "Ordering"]}
              selectedId={categoryId}
              onRowClick={setSelectedCategoryId}
              rows={(categoriesQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [item.id, item.key, item.name, item.ordering],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Category detail</h2>
            {categoryDetailQuery.data ? (
              <dl
                className="grid gap-2 text-sm"
                data-testid="category-detail"
              >
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                  <dd>{categoryDetailQuery.data.name}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Key</dt>
                  <dd>{categoryDetailQuery.data.key}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Module
                  </dt>
                  <dd>{categoryDetailQuery.data.moduleId ?? "—"}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="Select a category" />
            )}
          </div>
        </div>
      ) : null}

      {section === "sections" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {sectionsQuery.isLoading ? (
            <p role="status">Loading sections…</p>
          ) : (sectionsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No sections" />
          ) : (
            <MetaTable
              caption="Sections"
              columns={["ID", "Category", "Key", "Name"]}
              selectedId={sectionId}
              onRowClick={setSelectedSectionId}
              rows={(sectionsQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [item.id, item.categoryId, item.key, item.name],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Section detail</h2>
            {sectionDetailQuery.data ? (
              <dl className="grid gap-2 text-sm" data-testid="section-detail">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                  <dd>{sectionDetailQuery.data.name}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Key</dt>
                  <dd>{sectionDetailQuery.data.key}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="Select a section" />
            )}
          </div>
        </div>
      ) : null}

      {section === "registrations" ? (
        <div className="flex flex-col gap-3">
          <NoticeBanner
            text={REGISTRATION_BANNER}
            testId="banner-registration"
          />
          {registrationsQuery.isLoading ? (
            <p role="status">Loading registrations…</p>
          ) : (registrationsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No registrations" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetaTable
                caption="Registrations"
                columns={["ID", "Module", "Version", "Status"]}
                selectedId={registrationId}
                onRowClick={setSelectedRegistrationId}
                rows={(registrationsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [
                    item.id,
                    item.moduleKey,
                    item.version,
                    item.status,
                  ],
                }))}
              />
              <div>
                <h2 className="mb-2 text-lg font-medium">Registration detail</h2>
                {registrationDetailQuery.data ? (
                  <dl
                    className="grid gap-2 text-sm"
                    data-testid="registration-detail"
                  >
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Module key
                      </dt>
                      <dd>{registrationDetailQuery.data.moduleKey}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Version
                      </dt>
                      <dd>{registrationDetailQuery.data.version}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Notes
                      </dt>
                      <dd>{registrationDetailQuery.data.notes ?? "—"}</dd>
                    </div>
                  </dl>
                ) : (
                  <EmptyState title="Select a registration" />
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {section === "capabilities" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {capabilitiesQuery.isLoading ? (
            <p role="status">Loading capabilities…</p>
          ) : (capabilitiesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No capabilities" />
          ) : (
            <MetaTable
              caption="Capabilities"
              columns={["ID", "Key", "Name", "Enabled"]}
              selectedId={capabilityId}
              onRowClick={setSelectedCapabilityId}
              rows={(capabilitiesQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [
                  item.id,
                  item.key,
                  item.name,
                  item.enabled ? "yes" : "no",
                ],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Capability detail</h2>
            {capabilityDetailQuery.data ? (
              <dl className="grid gap-2 text-sm" data-testid="capability-detail">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                  <dd>{capabilityDetailQuery.data.name}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Enabled
                  </dt>
                  <dd>{capabilityDetailQuery.data.enabled ? "yes" : "no"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Available
                  </dt>
                  <dd>{capabilityDetailQuery.data.available ? "yes" : "no"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Healthy metadata
                  </dt>
                  <dd>{capabilityDetailQuery.data.healthy ? "yes" : "no"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Certified
                  </dt>
                  <dd>{capabilityDetailQuery.data.certified ? "yes" : "no"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Production ready
                  </dt>
                  <dd>
                    {capabilityDetailQuery.data.productionReady ? "yes" : "no"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Limitations
                  </dt>
                  <dd>
                    {(capabilityDetailQuery.data.limitations ?? []).join(", ") ||
                      "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="Select a capability" />
            )}
          </div>
        </div>
      ) : null}

      {section === "actions" ? (
        <div className="flex flex-col gap-3">
          <NoticeBanner text={ACTION_BANNER} testId="banner-actions" />
          {actionsQuery.isLoading ? (
            <p role="status">Loading actions…</p>
          ) : (actionsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No actions" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetaTable
                caption="Actions"
                columns={["ID", "Key", "Name", "Kind"]}
                selectedId={actionId}
                onRowClick={setSelectedActionId}
                rows={(actionsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [item.id, item.key, item.name, item.kind],
                }))}
              />
              <div>
                <h2 className="mb-2 text-lg font-medium">Action detail</h2>
                {actionDetailQuery.data ? (
                  <dl className="grid gap-2 text-sm">
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Name
                      </dt>
                      <dd>{actionDetailQuery.data.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Kind
                      </dt>
                      <dd>{actionDetailQuery.data.kind}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Execution
                      </dt>
                      <dd data-testid="action-no-execute">
                        Runtime execution is not available
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <EmptyState title="Select an action" />
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {section === "permissions" ? (
        <div className="flex flex-col gap-3">
          <NoticeBanner text={PERMISSION_BANNER} testId="banner-permissions" />
          {permissionsQuery.isLoading ? (
            <p role="status">Loading permissions…</p>
          ) : (permissionsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No permissions" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetaTable
                caption="Permissions"
                columns={["ID", "Key", "Name"]}
                selectedId={permissionId}
                onRowClick={setSelectedPermissionId}
                rows={(permissionsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [item.id, item.key, item.name],
                }))}
              />
              <div>
                <h2 className="mb-2 text-lg font-medium">Permission detail</h2>
                {permissionDetailQuery.data ? (
                  <dl className="grid gap-2 text-sm">
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Key
                      </dt>
                      <dd>{permissionDetailQuery.data.key}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Name
                      </dt>
                      <dd>{permissionDetailQuery.data.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Assignment
                      </dt>
                      <dd data-testid="permission-no-grant">
                        Grant / revoke is outside this milestone
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <EmptyState title="Select a permission" />
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {section === "policies" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {policiesQuery.isLoading ? (
            <p role="status">Loading policies…</p>
          ) : (policiesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No policies" />
          ) : (
            <MetaTable
              caption="Policies"
              columns={["ID", "Kind", "Key", "Name"]}
              selectedId={policyId}
              onRowClick={setSelectedPolicyId}
              rows={(policiesQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [item.id, item.kind, item.key, item.name],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Policy detail</h2>
            {policyDetailQuery.data ? (
              <dl className="grid gap-2 text-sm" data-testid="policy-detail">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                  <dd>{policyDetailQuery.data.name}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Kind</dt>
                  <dd>{policyDetailQuery.data.kind}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="Select a policy" />
            )}
          </div>
        </div>
      ) : null}

      {section === "navigation" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {navigationsQuery.isLoading ? (
            <p role="status">Loading navigation…</p>
          ) : (navigationsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No navigation entries" />
          ) : (
            <MetaTable
              caption="Navigation"
              columns={["ID", "Key", "Label", "Route"]}
              selectedId={navigationId}
              onRowClick={setSelectedNavigationId}
              rows={(navigationsQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [
                  item.id,
                  item.key,
                  item.label,
                  item.routePath ?? "—",
                ],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Navigation detail</h2>
            {navigationDetailQuery.data ? (
              <dl className="grid gap-2 text-sm" data-testid="navigation-detail">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Label</dt>
                  <dd>{navigationDetailQuery.data.label}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Visibility
                  </dt>
                  <dd>{navigationDetailQuery.data.visibility}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Route</dt>
                  <dd>{navigationDetailQuery.data.routePath ?? "—"}</dd>
                </div>
                {navigationDetailQuery.data.routePath ? (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(navigationDetailQuery.data!.routePath!)
                      }
                    >
                      Open route
                    </Button>
                  </div>
                ) : null}
              </dl>
            ) : (
              <EmptyState title="Select a navigation entry" />
            )}
          </div>
        </div>
      ) : null}

      {section === "shortcuts" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {shortcutsQuery.isLoading ? (
            <p role="status">Loading shortcuts…</p>
          ) : (shortcutsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No shortcuts" />
          ) : (
            <MetaTable
              caption="Shortcuts"
              columns={["ID", "Key", "Label", "Ordering"]}
              selectedId={shortcutId}
              onRowClick={setSelectedShortcutId}
              rows={(shortcutsQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [item.id, item.key, item.label, item.ordering],
              }))}
            />
          )}
          <div>
            <h2 className="mb-2 text-lg font-medium">Shortcut detail</h2>
            {shortcutDetailQuery.data ? (
              <dl className="grid gap-2 text-sm" data-testid="shortcut-detail">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Label</dt>
                  <dd>{shortcutDetailQuery.data.label}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Action
                  </dt>
                  <dd>{shortcutDetailQuery.data.actionId ?? "—"}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="Select a shortcut" />
            )}
          </div>
        </div>
      ) : null}

      {section === "dashboards" ? (
        <div className="flex flex-col gap-3">
          <NoticeBanner text={DASHBOARD_BANNER} testId="banner-dashboards" />
          {dashboardsQuery.isLoading ? (
            <p role="status">Loading dashboards…</p>
          ) : (dashboardsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No dashboards" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetaTable
                caption="Dashboards"
                columns={["ID", "Key", "Name"]}
                selectedId={dashboardId}
                onRowClick={setSelectedDashboardId}
                rows={(dashboardsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [item.id, item.key, item.name],
                }))}
              />
              <div>
                <h2 className="mb-2 text-lg font-medium">Dashboard detail</h2>
                {dashboardDetailQuery.data ? (
                  <dl
                    className="grid gap-2 text-sm"
                    data-testid="dashboard-detail"
                  >
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Name
                      </dt>
                      <dd>{dashboardDetailQuery.data.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Widgets (metadata)
                      </dt>
                      <dd>{widgetsQuery.data?.items.length ?? 0}</dd>
                    </div>
                  </dl>
                ) : (
                  <EmptyState title="Select a dashboard" />
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {section === "widgets" ? (
        <div className="flex flex-col gap-3">
          <NoticeBanner text={DASHBOARD_BANNER} testId="banner-widgets" />
          {!dashboardId ? (
            <EmptyState
              title="Select a dashboard first"
              description="Open Dashboards, select a row, then return to Widgets."
            />
          ) : widgetsQuery.isLoading ? (
            <p role="status">Loading widgets…</p>
          ) : (widgetsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No widgets" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetaTable
                caption="Widgets"
                columns={["ID", "Key", "Name", "Kind"]}
                selectedId={widgetId}
                onRowClick={setSelectedWidgetId}
                rows={(widgetsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [item.id, item.key, item.name, item.kind],
                }))}
              />
              <div>
                <h2 className="mb-2 text-lg font-medium">Widget detail</h2>
                {widgetDetailQuery.data ? (
                  <dl className="grid gap-2 text-sm" data-testid="widget-detail">
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Name
                      </dt>
                      <dd>{widgetDetailQuery.data.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Kind
                      </dt>
                      <dd>{widgetDetailQuery.data.kind}</dd>
                    </div>
                  </dl>
                ) : (
                  <EmptyState title="Select a widget" />
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {section === "references" ? (
        <div>
          {!moduleId ? (
            <EmptyState title="Select a module first" />
          ) : referencesQuery.isLoading ? (
            <p role="status">Loading references…</p>
          ) : (referencesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No references" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetaTable
                caption="References"
                columns={["ID", "Kind", "Resource", "Label"]}
                selectedId={referenceId}
                onRowClick={setSelectedReferenceId}
                rows={(referencesQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [
                    item.id,
                    item.kind,
                    item.resourceId,
                    item.label ?? "—",
                  ],
                }))}
              />
              <div>
                <h2 className="mb-2 text-lg font-medium">Reference detail</h2>
                {referenceDetailQuery.data ? (
                  <dl
                    className="grid gap-2 text-sm"
                    data-testid="reference-detail"
                  >
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Kind
                      </dt>
                      <dd>{referenceDetailQuery.data.kind}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted-foreground)]">
                        Resource
                      </dt>
                      <dd>{referenceDetailQuery.data.resourceId}</dd>
                    </div>
                  </dl>
                ) : (
                  <EmptyState title="Select a reference" />
                )}
              </div>
            </div>
          )}
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
              caption="Audit"
              testId="administration-audit-table"
              columns={["ID", "Action", "Actor", "Created"]}
              rows={(auditQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [
                  item.id,
                  item.action,
                  item.actorUserId,
                  item.createdAt,
                ],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "history" ? (
        <div>
          {!moduleId ? (
            <EmptyState title="Select a module first" />
          ) : historyQuery.isLoading ? (
            <p role="status">Loading history…</p>
          ) : (historyQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No history entries" />
          ) : (
            <MetaTable
              caption="History"
              testId="administration-history-table"
              columns={["ID", "Summary", "Actor", "Created"]}
              rows={(historyQuery.data?.items ?? []).map((item) => ({
                id: item.id,
                cells: [
                  item.id,
                  item.summary,
                  item.actorUserId,
                  item.createdAt,
                ],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "diagnostics" ? (
        <div className="flex flex-col gap-4">
          <NoticeBanner text={HEALTH_BANNER} testId="banner-health" />
          <NoticeBanner text={METADATA_BANNER} testId="banner-metadata" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatusCard
              label="Administration enabled"
              value={
                (
                  diagnosticsQuery.data as
                    | { administrationEnabled?: boolean }
                    | undefined
                )?.administrationEnabled
                  ? "Ready"
                  : "Unavailable"
              }
              testId="diag-administration"
            />
            <StatusCard
              label="HTTP enabled"
              value={
                (
                  diagnosticsQuery.data as { httpEnabled?: boolean } | undefined
                )?.httpEnabled
                  ? "Ready"
                  : "Unavailable"
              }
              testId="diag-http"
            />
            <StatusCard
              label="Workbench enabled"
              value={
                (
                  diagnosticsQuery.data as
                    | { workbenchEnabled?: boolean }
                    | undefined
                )?.workbenchEnabled
                  ? "Ready"
                  : "Unavailable"
              }
              testId="diag-workbench"
            />
            <StatusCard
              label="Runtime administration"
              value="Unavailable"
              testId="diag-runtime"
              emphasize
            />
            <StatusCard
              label="Live infrastructure probes"
              value="Unavailable"
              testId="diag-live-probes"
              emphasize
            />
            <StatusCard
              label="Event Bus"
              value="Unavailable"
              testId="diag-event-bus"
              emphasize
            />
            <StatusCard
              label="AI Administration"
              value="Unavailable"
              testId="diag-ai"
              emphasize
            />
            <StatusCard
              label="User Management"
              value="Unavailable"
              testId="diag-users"
              emphasize
            />
            <StatusCard
              label="Provisioning"
              value="Unavailable"
              testId="diag-provisioning"
              emphasize
            />
            <StatusCard
              label="Readiness"
              value={
                (readinessQuery.data as { ready?: boolean } | undefined)?.ready
                  ? "Ready"
                  : "Unavailable"
              }
              testId="diag-readiness"
            />
            <StatusCard
              label="Health metadata"
              value={String(
                (healthQuery.data as { status?: string } | undefined)?.status ??
                  "unknown",
              )}
              testId="diag-health"
            />
          </div>
          {diagnosticDetailQuery.data ? (
            <div
              className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm"
              data-testid="diagnostic-detail"
            >
              <p className="font-medium">{diagnosticDetailQuery.data.code}</p>
              <p className="text-[var(--color-muted-foreground)]">
                {diagnosticDetailQuery.data.message}
              </p>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UNAVAILABLE_CAPABILITIES.map((label) => (
              <StatusCard
                key={`diag-${label}`}
                label={label}
                value="Unavailable"
                emphasize
              />
            ))}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
