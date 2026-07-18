"use client";

/**
 * Platform Notification Workbench (APZNOTIFY-004).
 * Consumes only notification typed-client facades — no gateway/core/persistence.
 * Management plane only — DELIVERY PROVIDERS NOT AVAILABLE.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import {
  acknowledgeNotification,
  archiveNotification,
  dismissNotification,
  getNotification,
  getNotificationCapabilities,
  getNotificationCategory,
  getNotificationChannel,
  getNotificationDiagnostics,
  getNotificationHealth,
  getNotificationPreference,
  getNotificationReadiness,
  getNotificationRecipient,
  getNotificationReference,
  getNotificationTemplate,
  listNotificationAudit,
  listNotificationCategories,
  listNotificationChannels,
  listNotificationPreferences,
  listNotificationRecipients,
  listNotificationReferences,
  listNotifications,
  listNotificationTemplates,
  listScopedNotificationAudit,
  markNotificationRead,
  notificationQueryKeys,
  restoreNotification,
  transitionNotification,
} from "@/lib/notifications/notification-api";
import {
  NotificationClientError,
  toNotificationUserMessage,
} from "@/lib/notifications/notification-errors";
import type { NotificationsSection } from "@/lib/notifications/routes";

const DELIVERY_BANNER = "DELIVERY PROVIDERS NOT AVAILABLE";

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
    <div className="flex flex-col gap-6 p-1" data-testid="notifications-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Notifications
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
      data-testid="notifications-empty"
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
          ? "notifications-forbidden"
          : notFound
            ? "notifications-not-found"
            : "notifications-error"
      }
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {forbidden
          ? "Access denied"
          : notFound
            ? "Not found"
            : "Unable to load notifications"}
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
      <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function MetaTable({
  columns,
  rows,
  caption,
  onRowClick,
  selectedId,
  testId = "notifications-table",
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
                onRowClick ? "cursor-pointer hover:bg-[var(--color-muted)]/30" : "",
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
    error instanceof NotificationClientError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof NotificationClientError && error.status === 404;
}

const SECTION_META: Record<
  NotificationsSection,
  { readonly title: string; readonly description: string }
> = {
  overview: {
    title: "Overview",
    description:
      "Notification metadata dashboard — delivery providers are not available.",
  },
  notifications: {
    title: "Notifications",
    description: "Notification inbox and lifecycle metadata.",
  },
  templates: {
    title: "Templates",
    description: "Template catalogue — metadata only; no designer.",
  },
  preferences: {
    title: "Preferences",
    description: "Channel and category preference metadata.",
  },
  categories: {
    title: "Categories",
    description: "Notification category catalogue.",
  },
  channels: {
    title: "Channels",
    description: "Channel metadata — delivery unavailable for every channel.",
  },
  recipients: {
    title: "Recipients",
    description: "Recipient metadata for the selected notification.",
  },
  references: {
    title: "References",
    description: "Cross-product reference metadata — no product navigation.",
  },
  audit: {
    title: "Audit",
    description: "Read-only notification audit timeline.",
  },
  diagnostics: {
    title: "Diagnostics",
    description: "Health, readiness, and capabilities — delivery unavailable.",
  },
};

export function PlatformNotificationsView({
  section = "overview",
  canManage = true,
}: {
  readonly section?: NotificationsSection;
  /** Server remains authoritative; UI may hide lifecycle actions when false. */
  readonly canManage?: boolean;
}) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(
    null,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transitionTarget, setTransitionTarget] = useState("read");
  const [apiMetadataOpen, setApiMetadataOpen] = useState(false);

  const listQuery = useQuery({
    queryKey: notificationQueryKeys.list({
      status: statusFilter || undefined,
    }),
    queryFn: ({ signal }) =>
      listNotifications(
        {
          status: statusFilter || undefined,
          limit: 100,
        },
        { signal },
      ),
  });

  const selectedId = selectedNotificationId ?? listQuery.data?.items[0]?.id ?? null;

  const detailQuery = useQuery({
    queryKey: notificationQueryKeys.detail(selectedId ?? ""),
    queryFn: ({ signal }) => getNotification(selectedId!, { signal }),
    enabled: Boolean(selectedId),
  });

  const templatesQuery = useQuery({
    queryKey: notificationQueryKeys.templates.list(),
    queryFn: ({ signal }) => listNotificationTemplates({ signal }),
    enabled:
      section === "templates" || section === "overview" || section === "diagnostics",
  });

  const templateId = selectedTemplateId ?? templatesQuery.data?.items[0]?.id ?? null;
  const templateDetailQuery = useQuery({
    queryKey: notificationQueryKeys.templates.detail(templateId ?? ""),
    queryFn: ({ signal }) => getNotificationTemplate(templateId!, { signal }),
    enabled: Boolean(templateId) && section === "templates",
  });

  const preferencesQuery = useQuery({
    queryKey: notificationQueryKeys.preferences.list(),
    queryFn: ({ signal }) => listNotificationPreferences({ signal }),
    enabled: section === "preferences" || section === "overview",
  });

  const preferenceId =
    selectedPreferenceId ?? preferencesQuery.data?.items[0]?.id ?? null;
  const preferenceDetailQuery = useQuery({
    queryKey: notificationQueryKeys.preferences.detail(preferenceId ?? ""),
    queryFn: ({ signal }) => getNotificationPreference(preferenceId!, { signal }),
    enabled: Boolean(preferenceId) && section === "preferences",
  });

  const categoriesQuery = useQuery({
    queryKey: notificationQueryKeys.categories.list(),
    queryFn: ({ signal }) => listNotificationCategories({ signal }),
    enabled: section === "categories" || section === "overview",
  });

  const categoryId = selectedCategoryId ?? categoriesQuery.data?.items[0]?.id ?? null;
  const categoryDetailQuery = useQuery({
    queryKey: notificationQueryKeys.categories.detail(categoryId ?? ""),
    queryFn: ({ signal }) => getNotificationCategory(categoryId!, { signal }),
    enabled: Boolean(categoryId) && section === "categories",
  });

  const channelsQuery = useQuery({
    queryKey: notificationQueryKeys.channels.list(),
    queryFn: ({ signal }) => listNotificationChannels({ signal }),
    enabled: section === "channels" || section === "overview",
  });

  const channelId = selectedChannelId ?? channelsQuery.data?.items[0]?.id ?? null;
  const channelDetailQuery = useQuery({
    queryKey: notificationQueryKeys.channels.detail(channelId ?? ""),
    queryFn: ({ signal }) => getNotificationChannel(channelId!, { signal }),
    enabled: Boolean(channelId) && section === "channels",
  });

  const recipientsQuery = useQuery({
    queryKey: notificationQueryKeys.recipients(selectedId ?? ""),
    queryFn: ({ signal }) => listNotificationRecipients(selectedId!, { signal }),
    enabled:
      Boolean(selectedId) && (section === "recipients" || section === "notifications"),
  });

  const recipientId = selectedRecipientId ?? recipientsQuery.data?.items[0]?.id ?? null;
  const recipientDetailQuery = useQuery({
    queryKey: [
      ...notificationQueryKeys.recipients(selectedId ?? ""),
      recipientId ?? "",
    ],
    queryFn: ({ signal }) =>
      getNotificationRecipient(selectedId!, recipientId!, { signal }),
    enabled: Boolean(selectedId && recipientId) && section === "recipients",
  });

  const referencesQuery = useQuery({
    queryKey: notificationQueryKeys.references(selectedId ?? ""),
    queryFn: ({ signal }) => listNotificationReferences(selectedId!, { signal }),
    enabled:
      Boolean(selectedId) && (section === "references" || section === "notifications"),
  });

  const referenceId = selectedReferenceId ?? referencesQuery.data?.items[0]?.id ?? null;
  const referenceDetailQuery = useQuery({
    queryKey: ["notifications", "reference", referenceId ?? ""],
    queryFn: ({ signal }) => getNotificationReference(referenceId!, { signal }),
    enabled: Boolean(referenceId) && section === "references",
  });

  const auditQuery = useQuery({
    queryKey: selectedId
      ? notificationQueryKeys.audit.notification(selectedId)
      : notificationQueryKeys.audit.list(),
    queryFn: ({ signal }) =>
      selectedId
        ? listScopedNotificationAudit(selectedId, { signal })
        : listNotificationAudit({ signal }),
    enabled: section === "audit" || section === "notifications",
  });

  const capabilitiesQuery = useQuery({
    queryKey: notificationQueryKeys.capabilities(),
    queryFn: ({ signal }) => getNotificationCapabilities({ signal }),
    enabled: section === "diagnostics" || section === "overview",
  });
  const healthQuery = useQuery({
    queryKey: notificationQueryKeys.health(),
    queryFn: ({ signal }) => getNotificationHealth({ signal }),
    enabled: section === "diagnostics" || section === "overview",
  });
  const readinessQuery = useQuery({
    queryKey: notificationQueryKeys.readiness(),
    queryFn: ({ signal }) => getNotificationReadiness({ signal }),
    enabled: section === "diagnostics" || section === "overview",
  });
  const diagnosticsQuery = useQuery({
    queryKey: notificationQueryKeys.diagnostics(),
    queryFn: ({ signal }) => getNotificationDiagnostics({ signal }),
    enabled: section === "diagnostics" || section === "overview",
  });

  const lifecycleMutation = useMutation({
    mutationFn: async (
      action:
        "mark-read" | "acknowledge" | "dismiss" | "archive" | "restore" | "transition",
    ) => {
      if (!selectedId) throw new Error("No notification selected.");
      if (action === "mark-read") return markNotificationRead(selectedId);
      if (action === "acknowledge") return acknowledgeNotification(selectedId);
      if (action === "dismiss") return dismissNotification(selectedId);
      if (action === "archive") return archiveNotification(selectedId);
      if (action === "restore") return restoreNotification(selectedId);
      return transitionNotification(selectedId, { to: transitionTarget });
    },
    onSuccess: async (_data, action) => {
      setActionError(null);
      setStatusMessage(`Lifecycle action completed: ${action}.`);
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
    onError: (error) => {
      setStatusMessage(null);
      setActionError(toNotificationUserMessage(error));
    },
  });

  const items = listQuery.data?.items ?? [];
  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.status, (map.get(item.status) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const unreadCount =
    (statusCounts.get("pending") ?? 0) +
    (statusCounts.get("delivered") ?? 0) +
    (statusCounts.get("queued") ?? 0);
  const acknowledgedCount = statusCounts.get("acknowledged") ?? 0;
  const archivedCount = statusCounts.get("archived") ?? 0;

  const meta = SECTION_META[section];
  const listError = listQuery.error;
  const loading = listQuery.isLoading && !listQuery.data;

  async function refreshAll() {
    setActionError(null);
    setStatusMessage("Refreshed.");
    await queryClient.invalidateQueries({
      queryKey: notificationQueryKeys.all,
    });
  }

  async function onCopyId() {
    if (!selectedId) return;
    try {
      await copyText(selectedId);
      setStatusMessage("Copied notification ID.");
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to copy ID.");
    }
  }

  const toolbar = (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Notifications commands"
      data-testid="notifications-toolbar"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void refreshAll()}
      >
        Refresh
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setApiMetadataOpen((open) => !open)}
      >
        {apiMetadataOpen ? "Hide API Metadata" : "Open API Metadata"}
      </Button>
      {selectedId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void onCopyId()}
        >
          Copy ID
        </Button>
      ) : null}
      {canManage && selectedId && section === "notifications" ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={lifecycleMutation.isPending}
            onClick={() => lifecycleMutation.mutate("mark-read")}
          >
            Mark Read
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={lifecycleMutation.isPending}
            onClick={() => lifecycleMutation.mutate("acknowledge")}
          >
            Acknowledge
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={lifecycleMutation.isPending}
            onClick={() => lifecycleMutation.mutate("dismiss")}
          >
            Dismiss
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={lifecycleMutation.isPending}
            onClick={() => lifecycleMutation.mutate("archive")}
          >
            Archive
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={lifecycleMutation.isPending}
            onClick={() => lifecycleMutation.mutate("restore")}
          >
            Restore
          </Button>
          <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <span className="sr-only">Transition target</span>
            <select
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1"
              value={transitionTarget}
              onChange={(event) => setTransitionTarget(event.target.value)}
              aria-label="Transition target"
            >
              {[
                "draft",
                "pending",
                "read",
                "acknowledged",
                "dismissed",
                "expired",
                "archived",
              ].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={lifecycleMutation.isPending}
            onClick={() => lifecycleMutation.mutate("transition")}
          >
            Transition
          </Button>
        </>
      ) : null}
    </div>
  );

  let body: ReactNode = null;

  if (loading) {
    body = (
      <p
        className="text-sm text-[var(--color-muted-foreground)]"
        data-testid="notifications-loading"
      >
        Loading notifications…
      </p>
    );
  } else if (listError && (section === "overview" || section === "notifications")) {
    body = (
      <ErrorState
        message={toNotificationUserMessage(listError)}
        forbidden={isForbidden(listError)}
        notFound={isNotFound(listError)}
        onRetry={() => void listQuery.refetch()}
      />
    );
  } else if (section === "overview") {
    body = (
      <div className="flex flex-col gap-4">
        <StatusCard
          label="Delivery"
          value={DELIVERY_BANNER}
          testId="card-delivery-status"
          emphasize
        />
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          data-testid="notifications-overview-cards"
        >
          <StatusCard
            label="Total notifications"
            value={String(items.length)}
            testId="card-notifications-count"
          />
          <StatusCard label="Unread / pending" value={String(unreadCount)} />
          <StatusCard label="Acknowledged" value={String(acknowledgedCount)} />
          <StatusCard label="Archived" value={String(archivedCount)} />
          <StatusCard
            label="Templates"
            value={String(templatesQuery.data?.items.length ?? "—")}
          />
          <StatusCard
            label="Categories"
            value={String(categoriesQuery.data?.items.length ?? "—")}
          />
          <StatusCard
            label="Channels"
            value={String(channelsQuery.data?.items.length ?? "—")}
          />
          <StatusCard
            label="Recipients (selected)"
            value={String(recipientsQuery.data?.items.length ?? "—")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            label="Platform health"
            value={
              healthQuery.data?.healthy === true
                ? "Healthy"
                : (healthQuery.data?.status ?? "—")
            }
            testId="card-platform-health"
          />
          <StatusCard
            label="Notification service"
            value={
              capabilitiesQuery.data?.notificationEnabled ? "Enabled" : "Unavailable"
            }
          />
          <StatusCard
            label="Readiness"
            value={
              readinessQuery.data?.ready === true
                ? "Ready"
                : (readinessQuery.data?.status ?? "—")
            }
          />
        </div>
      </div>
    );
  } else if (section === "notifications") {
    body = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Input
            aria-label="Filter by status"
            placeholder="Filter by status (HTTP)"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          />
        </div>
        {items.length === 0 ? (
          <EmptyState
            title="No notifications found"
            description="Create metadata via the HTTP API — delivery is not available."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <MetaTable
              caption="Notification list"
              columns={["Title", "Status", "Priority", "Updated"]}
              selectedId={selectedId}
              onRowClick={setSelectedNotificationId}
              rows={items.map((item) => ({
                id: item.id,
                cells: [
                  item.title,
                  item.status,
                  item.priority,
                  item.updatedAt.slice(0, 19),
                ],
              }))}
            />
            <div
              className="rounded-lg border border-[var(--color-border)] p-4"
              data-testid="notifications-detail"
            >
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Details
              </h2>
              {detailQuery.isLoading ? (
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  Loading detail…
                </p>
              ) : detailQuery.error ? (
                <ErrorState
                  message={toNotificationUserMessage(detailQuery.error)}
                  forbidden={isForbidden(detailQuery.error)}
                  notFound={isNotFound(detailQuery.error)}
                />
              ) : detailQuery.data ? (
                <dl className="mt-3 grid gap-2 text-sm">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                    <dd className="font-mono">{detailQuery.data.id}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Title</dt>
                    <dd>{detailQuery.data.title}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Summary</dt>
                    <dd>{detailQuery.data.summary ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Lifecycle</dt>
                    <dd>{detailQuery.data.status}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
                    <dd>{detailQuery.data.priority}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Category</dt>
                    <dd>{detailQuery.data.categoryId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Channels</dt>
                    <dd>{detailQuery.data.channelKinds.join(", ") || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Revision</dt>
                    <dd>{detailQuery.data.revision}</dd>
                  </div>
                </dl>
              ) : null}
              {recipientsQuery.data?.items.length ? (
                <div className="mt-4">
                  <h3 className="text-sm font-medium">Recipients</h3>
                  <ul className="mt-1 list-inside list-disc text-sm">
                    {recipientsQuery.data.items.map((recipient) => (
                      <li key={recipient.id}>
                        {recipient.userId ?? recipient.id} ({recipient.channelKind})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {referencesQuery.data?.items.length ? (
                <div className="mt-4">
                  <h3 className="text-sm font-medium">References</h3>
                  <ul className="mt-1 list-inside list-disc text-sm">
                    {referencesQuery.data.items.map((reference) => (
                      <li key={reference.id}>
                        {reference.kind}:{reference.resourceId}
                        {reference.label ? ` — ${reference.label}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  } else if (section === "templates") {
    const templates = templatesQuery.data?.items ?? [];
    body = templatesQuery.error ? (
      <ErrorState
        message={toNotificationUserMessage(templatesQuery.error)}
        forbidden={isForbidden(templatesQuery.error)}
        onRetry={() => void templatesQuery.refetch()}
      />
    ) : templates.length === 0 ? (
      <EmptyState title="No templates" />
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        <MetaTable
          caption="Templates"
          columns={["Name", "Key", "Priority"]}
          selectedId={templateId}
          onRowClick={setSelectedTemplateId}
          rows={templates.map((item) => ({
            id: item.id,
            cells: [item.name, item.key, item.defaultPriority],
          }))}
        />
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-lg font-semibold">Template details</h2>
          {templateDetailQuery.data ? (
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                <dd className="font-mono">{templateDetailQuery.data.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                <dd>{templateDetailQuery.data.name}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Channels</dt>
                <dd>{templateDetailQuery.data.defaultChannelKinds.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">
                  Subject template
                </dt>
                <dd>{templateDetailQuery.data.subjectTemplate ?? "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              Select a template.
            </p>
          )}
        </div>
      </div>
    );
  } else if (section === "preferences") {
    const preferences = preferencesQuery.data?.items ?? [];
    body = preferencesQuery.error ? (
      <ErrorState
        message={toNotificationUserMessage(preferencesQuery.error)}
        forbidden={isForbidden(preferencesQuery.error)}
        onRetry={() => void preferencesQuery.refetch()}
      />
    ) : preferences.length === 0 ? (
      <EmptyState title="No preferences" />
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        <MetaTable
          caption="Preferences"
          columns={["User", "Channel", "Enabled"]}
          selectedId={preferenceId}
          onRowClick={setSelectedPreferenceId}
          rows={preferences.map((item) => ({
            id: item.id,
            cells: [item.userId, item.channelKind, String(item.enabled)],
          }))}
        />
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-lg font-semibold">Preference details</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Preference metadata only — no delivery configuration.
          </p>
          {preferenceDetailQuery.data ? (
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                <dd className="font-mono">{preferenceDetailQuery.data.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Quiet hours</dt>
                <dd>{preferenceDetailQuery.data.quietHours ?? "—"}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    );
  } else if (section === "categories") {
    const categories = categoriesQuery.data?.items ?? [];
    body = categoriesQuery.error ? (
      <ErrorState
        message={toNotificationUserMessage(categoriesQuery.error)}
        forbidden={isForbidden(categoriesQuery.error)}
        onRetry={() => void categoriesQuery.refetch()}
      />
    ) : categories.length === 0 ? (
      <EmptyState title="No categories" />
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        <MetaTable
          caption="Categories"
          columns={["Name", "Key"]}
          selectedId={categoryId}
          onRowClick={setSelectedCategoryId}
          rows={categories.map((item) => ({
            id: item.id,
            cells: [item.name, item.key],
          }))}
        />
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-lg font-semibold">Category details</h2>
          {categoryDetailQuery.data ? (
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                <dd className="font-mono">{categoryDetailQuery.data.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Description</dt>
                <dd>{categoryDetailQuery.data.description ?? "—"}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    );
  } else if (section === "channels") {
    const channels = channelsQuery.data?.items ?? [];
    body = channelsQuery.error ? (
      <ErrorState
        message={toNotificationUserMessage(channelsQuery.error)}
        forbidden={isForbidden(channelsQuery.error)}
        onRetry={() => void channelsQuery.refetch()}
      />
    ) : channels.length === 0 ? (
      <EmptyState title="No channels" />
    ) : (
      <div className="flex flex-col gap-4">
        <StatusCard
          label="Capability"
          value="Delivery unavailable"
          testId="channels-delivery-unavailable"
          emphasize
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <MetaTable
            caption="Channels"
            columns={["Name", "Kind", "Enabled", "Delivery"]}
            selectedId={channelId}
            onRowClick={setSelectedChannelId}
            rows={channels.map((item) => ({
              id: item.id,
              cells: [item.name, item.kind, String(item.enabled), "unavailable"],
            }))}
          />
          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <h2 className="text-lg font-semibold">Channel details</h2>
            {channelDetailQuery.data ? (
              <dl className="mt-3 grid gap-2 text-sm">
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                  <dd className="font-mono">{channelDetailQuery.data.id}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">Kind</dt>
                  <dd>{channelDetailQuery.data.kind}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Delivery available
                  </dt>
                  <dd>{String(channelDetailQuery.data.deliveryAvailable)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted-foreground)]">
                    Providers configured
                  </dt>
                  <dd>{String(channelDetailQuery.data.providersConfigured)}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </div>
      </div>
    );
  } else if (section === "recipients") {
    const recipients = recipientsQuery.data?.items ?? [];
    body = !selectedId ? (
      <EmptyState
        title="Select a notification"
        description="Open the Notifications section first, then return for recipients."
      />
    ) : recipientsQuery.error ? (
      <ErrorState
        message={toNotificationUserMessage(recipientsQuery.error)}
        forbidden={isForbidden(recipientsQuery.error)}
        onRetry={() => void recipientsQuery.refetch()}
      />
    ) : recipients.length === 0 ? (
      <EmptyState title="No recipients" />
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        <MetaTable
          caption="Recipients"
          columns={["User", "Channel", "Status"]}
          selectedId={recipientId}
          onRowClick={setSelectedRecipientId}
          rows={recipients.map((item) => ({
            id: item.id,
            cells: [item.userId ?? "—", item.channelKind, item.status],
          }))}
        />
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-lg font-semibold">Recipient details</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            No address editing. No delivery information.
          </p>
          {recipientDetailQuery.data ? (
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                <dd className="font-mono">{recipientDetailQuery.data.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Address hint</dt>
                <dd>{recipientDetailQuery.data.addressHint ?? "—"}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    );
  } else if (section === "references") {
    const references = referencesQuery.data?.items ?? [];
    body = !selectedId ? (
      <EmptyState title="Select a notification" />
    ) : referencesQuery.error ? (
      <ErrorState
        message={toNotificationUserMessage(referencesQuery.error)}
        forbidden={isForbidden(referencesQuery.error)}
        onRetry={() => void referencesQuery.refetch()}
      />
    ) : references.length === 0 ? (
      <EmptyState title="No references" />
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        <MetaTable
          caption="References"
          columns={["Kind", "Resource", "Label"]}
          selectedId={referenceId}
          onRowClick={setSelectedReferenceId}
          rows={references.map((item) => ({
            id: item.id,
            cells: [item.kind, item.resourceId, item.label ?? "—"],
          }))}
        />
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-lg font-semibold">Reference details</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Cross-product metadata only — no navigation into product internals.
          </p>
          {referenceDetailQuery.data ? (
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                <dd className="font-mono">{referenceDetailQuery.data.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Kind</dt>
                <dd>{referenceDetailQuery.data.kind}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Resource</dt>
                <dd>{referenceDetailQuery.data.resourceId}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    );
  } else if (section === "audit") {
    const entries = auditQuery.data?.items ?? [];
    body = auditQuery.error ? (
      <ErrorState
        message={toNotificationUserMessage(auditQuery.error)}
        forbidden={isForbidden(auditQuery.error)}
        onRetry={() => void auditQuery.refetch()}
      />
    ) : entries.length === 0 ? (
      <EmptyState title="No audit entries" />
    ) : (
      <ol
        className="flex flex-col gap-3"
        data-testid="notifications-audit-timeline"
        aria-label="Notification audit timeline"
      >
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-lg border border-[var(--color-border)] px-4 py-3"
          >
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              {entry.action}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Actor {entry.actorUserId} · {entry.createdAt}
              {entry.notificationId ? ` · ${entry.notificationId}` : ""}
            </p>
            {entry.detail ? (
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {entry.detail}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    );
  } else if (section === "diagnostics") {
    const diag = diagnosticsQuery.data;
    body = (
      <div className="flex flex-col gap-4" data-testid="notifications-diagnostics">
        <StatusCard
          label="Delivery"
          value={DELIVERY_BANNER}
          testId="diagnostics-delivery-status"
          emphasize
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            label="Delivery plane"
            value="unavailable"
            testId="diagnostics-delivery-unavailable"
          />
          <StatusCard label="Providers" value="unavailable" />
          <StatusCard label="Workers" value="unavailable" />
          <StatusCard label="Event Bus" value="unavailable" />
          <StatusCard label="Realtime" value="unavailable" />
          <StatusCard label="Persistence" value={diag?.persistenceMode ?? "—"} />
          <StatusCard
            label="Health"
            value={
              healthQuery.data?.healthy === true
                ? "ok"
                : (healthQuery.data?.status ?? "—")
            }
          />
          <StatusCard
            label="Readiness"
            value={
              readinessQuery.data?.ready === true
                ? "ready"
                : (readinessQuery.data?.status ?? "—")
            }
          />
          <StatusCard
            label="Platform services"
            value={diag?.platformServicesVersion ?? "—"}
          />
        </div>
        {capabilitiesQuery.data?.capabilities ? (
          <pre
            className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs"
            data-testid="diagnostics-capabilities-json"
          >
            {JSON.stringify(capabilitiesQuery.data.capabilities, null, 2)}
          </pre>
        ) : null}
      </div>
    );
  }

  return (
    <PageShell title={meta.title} description={meta.description} actions={toolbar}>
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage ?? ""}
      </div>
      {statusMessage ? (
        <p
          className="text-sm text-[var(--color-muted-foreground)]"
          data-testid="notifications-status"
        >
          {statusMessage}
        </p>
      ) : null}
      {actionError ? (
        <p
          className="text-sm text-[var(--color-destructive)]"
          role="alert"
          data-testid="notifications-action-error"
        >
          {actionError}
        </p>
      ) : null}
      {apiMetadataOpen ? (
        <pre
          className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs"
          data-testid="notifications-api-metadata"
        >
          {JSON.stringify(
            {
              selectedId,
              detail: detailQuery.data ?? null,
              delivery: DELIVERY_BANNER,
            },
            null,
            2,
          )}
        </pre>
      ) : null}
      {body}
    </PageShell>
  );
}
