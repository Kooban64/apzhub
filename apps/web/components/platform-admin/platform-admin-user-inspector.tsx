"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { PlatformAdminUserInspectorPayload } from "@/lib/platform-admin/build-user-inspector";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";
import { PlatformAdminManageAccess } from "@/components/platform-admin/platform-admin-manage-access";

type InspectorTabId =
  | "overview"
  | "products"
  | "roles"
  | "scopes"
  | "tools"
  | "provisioning"
  | "teams"
  | "sessions"
  | "activity"
  | "audit"
  | "gaps";

const TABS: readonly { id: InspectorTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "roles", label: "Roles & Permissions" },
  { id: "scopes", label: "Scopes" },
  { id: "tools", label: "Professional Tools" },
  { id: "provisioning", label: "Provisioning" },
  { id: "teams", label: "Teams" },
  { id: "sessions", label: "Sessions" },
  { id: "activity", label: "Activity" },
  { id: "audit", label: "Audit" },
  { id: "gaps", label: "Gap map" },
];

async function fetchInspector(
  tenantId: string,
  userId: string,
  apiPath: string,
): Promise<PlatformAdminUserInspectorPayload> {
  const res = await fetch(apiPath, { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformAdminUserInspectorPayload;
    error?: { message?: string };
  };
  if (res.status === 401 || res.status === 403) {
    throw new Error(body.error?.message ?? "Access denied");
  }
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Inspector failed (${res.status})`);
  }
  return body.data;
}

function productStatusLabel(status: string): string {
  switch (status) {
    case "granted":
      return "Access";
    case "org_subscribed_user_denied":
      return "No Access";
    case "org_not_subscribed":
      return "Org not subscribed";
    case "suggested_only":
      return "Suggested only";
    default:
      return status;
  }
}

function groupPermissions(
  lines: PlatformAdminUserInspectorPayload["permissions"]["lines"],
) {
  const groups = new Map<string, typeof lines>();
  for (const line of lines) {
    const parts = line.permissionKey.split(".");
    const group =
      parts.length >= 2 ? parts.slice(0, 2).join(".") : (parts[0] ?? "other");
    const list = groups.get(group) ?? [];
    groups.set(group, [...list, line]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function scopeGroups(scopes: PlatformAdminUserInspectorPayload["scopes"]) {
  const map = new Map<string, typeof scopes>();
  for (const s of scopes) {
    const label =
      s.kind === "projects.project"
        ? "PROJECTS"
        : s.kind === "support.queue"
          ? "SUPPORT QUEUES"
          : s.kind === "source.repo"
            ? "SOURCE REPOSITORIES"
            : s.kind.toUpperCase();
    const list = map.get(label) ?? [];
    map.set(label, [...list, s]);
  }
  return [...map.entries()];
}

export function PlatformAdminUserInspector({
  tenantId,
  userId,
  apiPath,
  backHref,
  backLabel,
  context = "platform-admin",
  allowManageAccess = true,
}: {
  readonly tenantId: string;
  readonly userId: string;
  /** Override inspector API path (Organisation Admin uses session-scoped route). */
  readonly apiPath?: string;
  readonly backHref?: string;
  readonly backLabel?: string;
  readonly context?: "platform-admin" | "organisation-admin";
  readonly allowManageAccess?: boolean;
}) {
  const resolvedApi =
    apiPath ??
    `/api/v1/platform-admin/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(userId)}`;
  const q = useQuery({
    queryKey: [context, "user-inspector", tenantId, userId, resolvedApi],
    queryFn: () => fetchInspector(tenantId, userId, resolvedApi),
  });
  const [tab, setTab] = useState<InspectorTabId>("overview");
  const [showManage, setShowManage] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);

  const permissionGroups = useMemo(
    () => (q.data ? groupPermissions(q.data.permissions.lines) : []),
    [q.data],
  );

  const selectedLine = useMemo(() => {
    if (!q.data || !selectedPermission) return null;
    return (
      q.data.permissions.lines.find((l) => l.permissionKey === selectedPermission) ??
      null
    );
  }, [q.data, selectedPermission]);

  const usersHref =
    backHref ?? `${PLATFORM_ADMIN_BASE}/tenants/${encodeURIComponent(tenantId)}/users`;
  const usersLabel = backLabel ?? `${q.data?.tenantName ?? "Tenant"} / Users`;

  return (
    <div
      className="flex flex-col gap-3 p-4"
      data-testid={
        context === "organisation-admin"
          ? "organisation-admin-person"
          : "platform-admin-user-inspector"
      }
      data-user-inspector={context}
    >
      <Link
        href={usersHref}
        className="text-xs text-[var(--color-primary)] hover:underline"
        data-testid="inspector-back-users"
      >
        ← {usersLabel}
      </Link>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Loading inspector…
        </p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data ? (
        <>
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-lg font-semibold tracking-tight">
                  {q.data.user.displayName}
                </h1>
                <span className="text-xs capitalize text-[var(--color-muted-foreground)]">
                  ● {q.data.user.status}
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {q.data.user.email}
              </p>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">
                {[
                  q.data.organisational.department.availability === "ok"
                    ? q.data.organisational.department.value
                    : null,
                  q.data.organisational.staffFunction.availability === "ok"
                    ? q.data.organisational.staffFunction.value
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Organisational function — not configured"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {allowManageAccess ? (
                <button
                  type="button"
                  title={q.data.manageAccess.message}
                  className="rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs hover:bg-[var(--color-muted)]"
                  data-testid="inspector-manage-access"
                  data-availability={q.data.manageAccess.availability}
                  onClick={() => setShowManage((v) => !v)}
                >
                  {showManage ? "Close Manage Access" : "Manage Access"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Product access writes use tenant IAM routes — not wired on this Organisation Admin slice"
                  className="cursor-not-allowed rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
                  data-testid="inspector-manage-access"
                  data-availability="not_configured"
                >
                  Manage Access
                </button>
              )}
              <button
                type="button"
                disabled
                title="Actions reserved for later write model"
                className="cursor-not-allowed rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
              >
                Actions ▾
              </button>
            </div>
          </header>

          {allowManageAccess && showManage ? (
            <PlatformAdminManageAccess
              tenantId={tenantId}
              userId={userId}
              currentProducts={q.data.products.map((p) => ({
                productKey: p.productKey,
                roleLabel: "roleLabel" in p ? String(p.roleLabel) : p.status,
                status: p.status,
              }))}
            />
          ) : null}

          {/* Compact overview + access summary */}
          <section
            className="grid gap-4 border-b border-[var(--color-border)] pb-3 sm:grid-cols-2"
            data-testid="inspector-summary"
          >
            <div>
              <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                Overview
              </h2>
              <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-[var(--color-muted-foreground)]">Organisation</dt>
                <dd>{q.data.tenantName}</dd>
                <dt className="text-[var(--color-muted-foreground)]">Manager</dt>
                <dd title={q.data.organisational.manager.message}>
                  {q.data.organisational.manager.availability === "ok"
                    ? q.data.organisational.manager.value
                    : "—"}
                </dd>
                <dt className="text-[var(--color-muted-foreground)]">Department</dt>
                <dd title={q.data.organisational.department.message}>
                  {q.data.organisational.department.availability === "ok"
                    ? q.data.organisational.department.value
                    : "—"}
                </dd>
                <dt className="text-[var(--color-muted-foreground)]">Staff Function</dt>
                <dd title={q.data.organisational.staffFunction.message}>
                  {q.data.organisational.staffFunction.availability === "ok"
                    ? q.data.organisational.staffFunction.value
                    : "—"}
                </dd>
                <dt className="text-[var(--color-muted-foreground)]">Job Title</dt>
                <dd title={q.data.organisational.jobTitle.message}>
                  {q.data.organisational.jobTitle.availability === "ok"
                    ? q.data.organisational.jobTitle.value
                    : "—"}
                </dd>
                <dt className="text-[var(--color-muted-foreground)]">Last Active</dt>
                <dd title="Sessions not configured">—</dd>
              </dl>
            </div>
            <div>
              <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                Access summary
              </h2>
              <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-[var(--color-muted-foreground)]">Products</dt>
                <dd className="tabular-nums" data-testid="inspector-summary-products">
                  {q.data.accessSummary.products ?? "—"}
                </dd>
                <dt className="text-[var(--color-muted-foreground)]">Teams</dt>
                <dd title={q.data.accessSummary.teams.message}>
                  {q.data.accessSummary.teams.availability === "ok"
                    ? q.data.accessSummary.teams.value
                    : q.data.accessSummary.teams.availability === "empty"
                      ? "0"
                      : "Not configured"}
                </dd>
                <dt className="text-[var(--color-muted-foreground)]">Professional</dt>
                <dd className="tabular-nums" data-testid="inspector-summary-tools">
                  {q.data.accessSummary.professionalTools ?? "—"}
                </dd>
                <dt className="text-[var(--color-muted-foreground)]">Privileged</dt>
                <dd title={q.data.accessSummary.privileged.message}>Not configured</dd>
              </dl>
              <div
                className="mt-3 border-t border-[var(--color-border)]/60 pt-2"
                data-testid="inspector-platform-access"
              >
                <h3 className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
                  Platform access
                </h3>
                <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 text-xs">
                  <dt className="text-[var(--color-muted-foreground)]">
                    Platform Role
                  </dt>
                  <dd title={q.data.platformAccess.platformRole.message}>
                    {q.data.platformAccess.platformRole.value ?? "None"}
                  </dd>
                </dl>
              </div>
            </div>
          </section>

          <div
            role="tablist"
            aria-label="User Inspector sections"
            className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
            data-testid="inspector-tabs"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`rounded px-2.5 py-1.5 text-xs ${
                  tab === t.id
                    ? "bg-[var(--color-muted)] font-medium"
                    : "hover:bg-[var(--color-muted)]/60"
                }`}
                data-testid={`inspector-tab-${t.id}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-[12rem]" data-testid={`inspector-panel-${tab}`}>
            {tab === "overview" ? (
              <div className="space-y-3 text-xs">
                <p className="text-[var(--color-muted-foreground)]">
                  Use Products, Roles & Permissions, Scopes and Professional Tools to
                  answer who / what / where / why. Organisational fields above are
                  descriptive — not effective permissions.
                </p>
                {q.data.inspection?.why && q.data.inspection.why.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1 text-[var(--color-muted-foreground)]">
                    {q.data.inspection.why.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--color-muted-foreground)]">
                    Org IAM ledger inspection unavailable for this membership — product
                    grants and AuthZ effective set are still shown on their tabs.
                  </p>
                )}
              </div>
            ) : null}

            {tab === "products" ? (
              <div data-testid="inspector-products">
                {q.data.products.length === 0 ? (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    No organisation subscriptions or user product grants on file.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
                    {q.data.products.map((p) => {
                      const relatedScopes = q.data.scopes
                        .filter(
                          (s) =>
                            s.productKey === p.productKey ||
                            (p.productKey === "projects"
                              ? s.kind.startsWith("projects.")
                              : p.productKey === "support"
                                ? s.kind.startsWith("support.")
                                : p.productKey === "qep"
                                  ? s.kind.startsWith("qep.")
                                  : p.productKey === "pentest"
                                    ? s.kind.startsWith("pen.") ||
                                      s.kind === "source.repo"
                                    : false),
                        )
                        .map((s) => s.resourceId);
                      return (
                        <li
                          key={p.productKey}
                          className="flex flex-wrap items-start justify-between gap-2 px-3 py-2.5 text-xs"
                          data-testid={`inspector-product-${p.productKey}`}
                          data-status={p.status}
                        >
                          <div>
                            <div className="font-medium">{p.displayName}</div>
                            <div className="text-[var(--color-muted-foreground)]">
                              {p.status === "granted"
                                ? "roleLabel" in p
                                  ? p.roleLabel
                                  : "Granted"
                                : productStatusLabel(p.status)}
                            </div>
                            {"accessSources" in p && p.accessSources.length > 0 ? (
                              <div className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)]">
                                Access sources:{" "}
                                {p.accessSources
                                  .map((s) => `${s.label} · ${s.roleName}`)
                                  .join("; ")}
                              </div>
                            ) : null}
                            {relatedScopes.length > 0 ? (
                              <div className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)]">
                                Scope: {relatedScopes.join(", ")}
                              </div>
                            ) : null}
                            <div className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)]">
                              {p.why}
                            </div>
                          </div>
                          {p.status === "granted" ? (
                            <span className="text-[11px] text-[var(--color-muted-foreground)]">
                              View Access →
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}

            {tab === "roles" ? (
              <div className="space-y-4" data-testid="inspector-roles">
                <div>
                  <h3 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                    Roles
                  </h3>
                  {q.data.roles.length === 0 ? (
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      No role assignments resolved.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] text-xs">
                      {q.data.roles.map((r) => (
                        <li key={`${r.source}-${r.id}`} className="px-3 py-2">
                          <div className="font-medium">{r.label}</div>
                          <div className="text-[11px] text-[var(--color-muted-foreground)]">
                            {r.source} · {r.why}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
                    Effective permissions
                  </h3>
                  <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                    {q.data.permissions.provenanceNote}
                  </p>
                  {q.data.permissions.availability === "empty" ? (
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {q.data.permissions.message}
                    </p>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
                      <div className="space-y-3">
                        {permissionGroups.map(([group, lines]) => (
                          <div key={group}>
                            <h4 className="mb-1 text-[11px] font-medium tracking-wide uppercase text-[var(--color-muted-foreground)]">
                              {group}
                            </h4>
                            <ul className="divide-y divide-[var(--color-border)]/70 border border-[var(--color-border)] text-xs">
                              {lines.map((line) => (
                                <li key={line.permissionKey}>
                                  <button
                                    type="button"
                                    className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-[var(--color-muted)]/40 ${
                                      selectedPermission === line.permissionKey
                                        ? "bg-[var(--color-muted)]/50"
                                        : ""
                                    }`}
                                    data-testid={`inspector-perm-${line.permissionKey}`}
                                    onClick={() =>
                                      setSelectedPermission(line.permissionKey)
                                    }
                                  >
                                    <span className="font-mono text-[11px]">
                                      {line.permissionKey}
                                    </span>
                                    <span className="shrink-0 text-[11px]">
                                      {line.allowed ? "✓ Allowed" : "— Denied"}
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <aside
                        className="h-fit border border-[var(--color-border)] p-3 text-xs"
                        data-testid="inspector-permission-detail"
                      >
                        {selectedLine ? (
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-[11px] text-[var(--color-muted-foreground)]">
                                Permission
                              </dt>
                              <dd className="font-mono text-[11px]">
                                {selectedLine.permissionKey}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[11px] text-[var(--color-muted-foreground)]">
                                Decision
                              </dt>
                              <dd>{selectedLine.allowed ? "ALLOWED" : "DENIED"}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] text-[var(--color-muted-foreground)]">
                                Granted by
                              </dt>
                              <dd title={selectedLine.provenance.message}>
                                {selectedLine.provenance.grantedBy ||
                                  (selectedLine.provenance.matchedRoleIds ?? []).join(
                                    ", ",
                                  ) ||
                                  "Unavailable"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[11px] text-[var(--color-muted-foreground)]">
                                Product
                              </dt>
                              <dd>{selectedLine.provenance.productKey ?? "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] text-[var(--color-muted-foreground)]">
                                Tenant
                              </dt>
                              <dd>{q.data.tenantName}</dd>
                            </div>
                            <div>
                              <dt className="text-[11px] text-[var(--color-muted-foreground)]">
                                Scope / Resource
                              </dt>
                              <dd title="Bulk provenance not available">Unavailable</dd>
                            </div>
                            <p className="text-[11px] text-[var(--color-muted-foreground)]">
                              {selectedLine.provenance.message}
                            </p>
                          </dl>
                        ) : (
                          <p className="text-[var(--color-muted-foreground)]">
                            Select a permission to inspect decision detail.
                          </p>
                        )}
                      </aside>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {tab === "scopes" ? (
              <div data-testid="inspector-scopes">
                {q.data.scopes.length === 0 ? (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    No resource-scope grants on the effective permission set.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {scopeGroups(q.data.scopes).map(([label, items]) => (
                      <div key={label}>
                        <h3 className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
                          {label}
                        </h3>
                        <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] text-xs">
                          {items.map((s) => (
                            <li
                              key={s.grantKey}
                              className="flex justify-between gap-2 px-3 py-2"
                              data-testid={`inspector-scope-${s.grantKey}`}
                            >
                              <span className="font-mono">{s.resourceId}</span>
                              <span className="text-[var(--color-muted-foreground)]">
                                {s.kind}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {tab === "tools" ? (
              <div data-testid="inspector-tools">
                <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                  Professional Tools are independent of product access. Do not infer
                  tool access from Products.
                </p>
                <table className="w-full border-collapse border border-[var(--color-border)] text-left text-xs">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Tool</th>
                      <th className="px-3 py-2 font-medium">Access</th>
                      <th className="px-3 py-2 font-medium">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.data.professionalTools.map((t) => (
                      <tr
                        key={t.toolId}
                        className="border-b border-[var(--color-border)]/70 last:border-0"
                        data-testid={`inspector-tool-${t.toolId}`}
                        data-status={t.status}
                      >
                        <td className="px-3 py-2 font-medium">{t.label}</td>
                        <td className="px-3 py-2">
                          {t.status === "granted" ? "Enabled" : "No Access"}
                        </td>
                        <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                          {t.expiresAt ? `Until ${t.expiresAt}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {tab === "provisioning" ? (
              <div className="text-xs text-[var(--color-muted-foreground)]">
                {q.data.inspection?.tabs.provisioning ? (
                  <ul className="list-inside list-disc space-y-1">
                    {q.data.inspection.tabs.provisioning.why.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Provisioning detail requires an org-member ledger row — not
                    configured here.
                  </p>
                )}
              </div>
            ) : null}

            {tab === "teams" ? (
              <div className="text-xs" data-testid="inspector-teams">
                {"teams" in q.data && q.data.teams.length > 0 ? (
                  <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
                    {q.data.teams.map((t) => (
                      <li key={t.id} className="px-3 py-2">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-[11px] text-[var(--color-muted-foreground)]">
                          Team id {t.id}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--color-muted-foreground)]">
                    No team memberships for this user.
                  </p>
                )}
              </div>
            ) : null}

            {tab === "sessions" ? (
              <div className="text-xs" data-testid="inspector-sessions">
                {"sessions" in q.data &&
                q.data.sessions &&
                q.data.sessions.lines.length > 0 ? (
                  <table className="w-full border-collapse border border-[var(--color-border)] text-left">
                    <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                      <tr>
                        <th className="px-3 py-2 font-medium">Session</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Expires</th>
                        <th className="px-3 py-2 font-medium">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.data.sessions.lines.map((s) => (
                        <tr
                          key={s.sessionId}
                          className="border-b border-[var(--color-border)]/70"
                        >
                          <td className="px-3 py-2 font-mono text-[11px]">
                            {s.sessionId}
                          </td>
                          <td className="px-3 py-2 capitalize">{s.status}</td>
                          <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                            {s.expiresAt}
                          </td>
                          <td className="px-3 py-2 text-[var(--color-muted-foreground)]">
                            {s.ipAddress ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-[var(--color-muted-foreground)]">
                    {("sessions" in q.data && q.data.sessions?.message) ||
                      "No BetterAuth sessions listed for this user."}
                  </p>
                )}
              </div>
            ) : null}

            {tab === "activity" ? (
              <div className="text-xs" data-testid="inspector-activity">
                {Array.isArray(q.data.timeline.activity) &&
                (q.data.timeline.activity as unknown[]).length > 0 ? (
                  <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
                    {(
                      q.data.timeline.activity as {
                        id: string;
                        title: string;
                        timestamp: string;
                      }[]
                    ).map((a) => (
                      <li key={a.id} className="px-3 py-2">
                        <div className="font-medium">{a.title}</div>
                        <div className="text-[11px] text-[var(--color-muted-foreground)]">
                          {a.timestamp}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--color-muted-foreground)]">
                    No activity attributed to this user.
                  </p>
                )}
              </div>
            ) : null}

            {tab === "audit" ? (
              <div className="text-xs" data-testid="inspector-audit">
                {Array.isArray(q.data.timeline.audit) &&
                (q.data.timeline.audit as unknown[]).length > 0 ? (
                  <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
                    {(
                      q.data.timeline.audit as {
                        id: string;
                        summary: string;
                        timestamp: string;
                      }[]
                    ).map((a) => (
                      <li key={a.id} className="px-3 py-2">
                        <div className="font-medium">{a.summary}</div>
                        <div className="text-[11px] text-[var(--color-muted-foreground)]">
                          {a.timestamp}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--color-muted-foreground)]">
                    No audit events for this user.
                  </p>
                )}
              </div>
            ) : null}

            {tab === "gaps" ? (
              <div className="overflow-x-auto" data-testid="inspector-gaps">
                <table className="w-full min-w-[40rem] border-collapse border border-[var(--color-border)] text-left text-xs">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                    <tr>
                      <th className="px-2 py-2 font-medium">Requirement</th>
                      <th className="px-2 py-2 font-medium">Existing source</th>
                      <th className="px-2 py-2 font-medium">Reusable?</th>
                      <th className="px-2 py-2 font-medium">Gap</th>
                      <th className="px-2 py-2 font-medium">Recommended extension</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.data.gaps.map((g) => (
                      <tr
                        key={g.requirement}
                        className="border-b border-[var(--color-border)]/70 align-top last:border-0"
                      >
                        <td className="px-2 py-2 font-medium">{g.requirement}</td>
                        <td className="px-2 py-2 text-[var(--color-muted-foreground)]">
                          {g.existingSource}
                        </td>
                        <td className="px-2 py-2">{g.reusable ? "Yes" : "No"}</td>
                        <td className="px-2 py-2">{g.gap}</td>
                        <td className="px-2 py-2 text-[var(--color-muted-foreground)]">
                          {g.recommendedExtension}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
