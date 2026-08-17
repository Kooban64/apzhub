"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type {
  FieldAvailability,
  MetricField,
  OverviewWindow,
  PlatformAdminOverview,
} from "@/lib/platform-admin/overview-types";
import { DataTable } from "@/components/operator/operator-ui";

async function fetchOverview(window: OverviewWindow): Promise<PlatformAdminOverview> {
  const res = await fetch(`/api/v1/platform-admin/overview?window=${window}`, {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: PlatformAdminOverview;
    error?: { message?: string };
  };
  if (res.status === 401 || res.status === 403) {
    throw new Error(body.error?.message ?? "Access denied");
  }
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Overview failed (${res.status})`);
  }
  return body.data;
}

function formatMetric(field: MetricField<string | number> | undefined): string {
  if (!field) return "—";
  if (field.availability !== "ok" || field.value === undefined) {
    return availabilityLabel(field.availability);
  }
  return String(field.value);
}

function availabilityLabel(a: FieldAvailability): string {
  switch (a) {
    case "unavailable":
      return "Unavailable";
    case "not_configured":
      return "Not configured";
    case "empty":
      return "Empty";
    case "error":
      return "Error";
    default:
      return "—";
  }
}

function statusDotClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "healthy" || s === "operational" || s === "ok") {
    return "text-[var(--color-success)]";
  }
  if (s === "degraded" || s === "warning") {
    return "text-[var(--color-warning)]";
  }
  if (s === "unhealthy" || s === "critical" || s === "error") {
    return "text-[var(--color-destructive)]";
  }
  return "text-[var(--color-muted-foreground)]";
}

function Panel({
  title,
  children,
  action,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly action?: React.ReactNode;
}) {
  return (
    <section className="rounded border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2">
        <h2 className="text-[11px] font-semibold tracking-wide uppercase">{title}</h2>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function HonestValue({
  field,
  className = "",
}: {
  readonly field: MetricField<string | number>;
  readonly className?: string;
}) {
  const label = formatMetric(field);
  const isHonest = field.availability !== "ok";
  return (
    <span
      className={`${className} ${isHonest ? "text-[var(--color-muted-foreground)]" : ""}`}
      title={field.message}
    >
      {label}
    </span>
  );
}

export function PlatformAdminOverviewView() {
  const [window, setWindow] = useState<OverviewWindow>("24h");
  const q = useQuery({
    queryKey: ["platform-admin", "overview", window],
    queryFn: () => fetchOverview(window),
    retry: 1,
  });

  const data = q.data;

  const attentionRows = useMemo(() => {
    if (!data || data.attention.availability !== "ok") return [];
    return data.attention.items.map((item) => [
      item.severity,
      item.area,
      item.tenant,
      item.issue,
      item.age,
    ]);
  }, [data]);

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-overview">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Overview</h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Platform operations, customers and services
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <span className="sr-only">Time window</span>
          <select
            className="h-7 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2"
            value={window}
            onChange={(e) => setWindow(e.target.value as OverviewWindow)}
            data-testid="platform-admin-overview-window"
            aria-label="Overview time window"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>
      </div>

      {q.isLoading ? (
        <p
          className="text-xs text-[var(--color-muted-foreground)]"
          data-testid="platform-admin-overview-loading"
        >
          Loading overview…
        </p>
      ) : null}

      {q.isError ? (
        <p
          className="rounded border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/5 px-3 py-2 text-xs text-[var(--color-destructive)]"
          role="alert"
          data-testid="platform-admin-overview-error"
        >
          {(q.error as Error).message}
        </p>
      ) : null}

      {data ? (
        <>
          <section
            className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5"
            aria-label="Platform status"
            data-testid="platform-admin-status-strip"
          >
            <p className="mb-2 text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
              Platform status
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium capitalize">
                <span
                  className={statusDotClass(
                    String(data.platformStatus.overall.value ?? ""),
                  )}
                  aria-hidden
                >
                  ●
                </span>
                <HonestValue field={data.platformStatus.overall} />
              </span>
              <span>
                <HonestValue field={data.platformStatus.tenants} /> Tenants
              </span>
              <span>
                <HonestValue field={data.platformStatus.users} /> Users
              </span>
              <span title={data.platformStatus.providers.message}>
                <HonestValue field={data.platformStatus.providers} /> Providers
              </span>
              <span title={data.platformStatus.warnings.message}>
                <HonestValue field={data.platformStatus.warnings} /> Warnings
              </span>
            </div>
          </section>

          <div className="grid gap-3 lg:grid-cols-2">
            <Panel
              title="Tenants"
              action={
                <Link
                  href={data.tenants.href}
                  className="text-[11px] text-[var(--color-primary)] hover:underline"
                >
                  View Tenants →
                </Link>
              }
            >
              {data.tenants.availability === "error" ? (
                <p className="text-xs text-[var(--color-destructive)]">
                  Failed to load tenants
                </p>
              ) : (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {(
                    [
                      ["Active", data.tenants.active],
                      ["Trial", data.tenants.trial],
                      ["Suspended", data.tenants.suspended],
                      ["Provisioning Issues", data.tenants.provisioningIssues],
                    ] as const
                  ).map(([label, field]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-2 border-b border-[var(--color-border)]/60 py-1"
                    >
                      <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
                      <dd className="font-medium">
                        <HonestValue field={field} />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </Panel>

            <Panel title="Platform health">
              <ul className="space-y-1.5 text-xs">
                {data.platformHealth.capabilities.map((cap) => (
                  <li
                    key={cap.id}
                    className="flex items-center justify-between gap-2 border-b border-[var(--color-border)]/60 py-1"
                    title={cap.message}
                  >
                    <span>{cap.label}</span>
                    <span
                      className={`inline-flex items-center gap-1 capitalize ${statusDotClass(cap.status)}`}
                    >
                      <span aria-hidden>●</span>
                      {cap.status === "unavailable" ? "Unavailable" : cap.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel
              title="Provisioning"
              action={
                <Link
                  href={data.provisioning.href}
                  className="text-[11px] text-[var(--color-primary)] hover:underline"
                >
                  Open Provisioning →
                </Link>
              }
            >
              <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                {data.provisioning.message ??
                  availabilityLabel(data.provisioning.availability)}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {(
                  [
                    ["Pending", data.provisioning.pending],
                    ["Processing", data.provisioning.processing],
                    ["Failed", data.provisioning.failed],
                    ["Completed today", data.provisioning.completedToday],
                  ] as const
                ).map(([label, field]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-2 border-b border-[var(--color-border)]/60 py-1"
                  >
                    <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
                    <dd>
                      <HonestValue field={field} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel
              title="Billing"
              action={
                <Link
                  href={data.billing.href}
                  className="text-[11px] text-[var(--color-primary)] hover:underline"
                >
                  Open Billing →
                </Link>
              }
            >
              <p className="mb-2 text-[11px] text-[var(--color-muted-foreground)]">
                {data.billing.message ?? availabilityLabel(data.billing.availability)}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {(
                  [
                    ["Monthly revenue", data.billing.monthlyRevenue],
                    ["Outstanding", data.billing.outstanding],
                    ["Failed payments", data.billing.failedPayments],
                    ["Renewals — 30 days", data.billing.renewals30d],
                  ] as const
                ).map(([label, field]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-2 border-b border-[var(--color-border)]/60 py-1"
                  >
                    <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
                    <dd>
                      <HonestValue field={field} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          <Panel
            title="Attention required"
            action={
              <Link
                href={data.attention.href}
                className="text-[11px] text-[var(--color-primary)] hover:underline"
              >
                View All Issues →
              </Link>
            }
          >
            {data.attention.availability === "ok" ? (
              <DataTable
                columns={["Severity", "Area", "Tenant", "Issue", "Age"]}
                rows={attentionRows}
                empty="No attention items."
              />
            ) : (
              <p
                className="text-xs text-[var(--color-muted-foreground)]"
                data-testid="platform-admin-attention-unavailable"
              >
                {data.attention.message ??
                  availabilityLabel(data.attention.availability)}
              </p>
            )}
          </Panel>

          <Panel
            title="Recent platform activity"
            action={
              <Link
                href={data.activity.href}
                className="text-[11px] text-[var(--color-primary)] hover:underline"
              >
                View Audit →
              </Link>
            }
          >
            {data.activity.availability === "ok" && data.activity.items.length > 0 ? (
              <ul className="space-y-1.5 text-xs">
                {data.activity.items.map((item) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[4.5rem_1fr_auto] gap-2 border-b border-[var(--color-border)]/60 py-1"
                  >
                    <span className="font-mono text-[var(--color-muted-foreground)]">
                      {item.at}
                    </span>
                    <span>
                      <span className="font-medium">{item.subject}</span> {item.summary}
                    </span>
                    <span className="text-[var(--color-muted-foreground)]">
                      {item.actor}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="text-xs text-[var(--color-muted-foreground)]"
                data-testid="platform-admin-activity-unavailable"
              >
                {data.activity.message ?? availabilityLabel(data.activity.availability)}
              </p>
            )}
          </Panel>
        </>
      ) : null}
    </div>
  );
}
