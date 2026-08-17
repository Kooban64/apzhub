"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  MetricOrGap,
  OpsStatusBadge,
} from "@/components/platform-admin/ops-status-badge";
import type { PlatformSecurityPayload } from "@/lib/platform-admin/build-platform-security";

async function fetchSecurity(): Promise<PlatformSecurityPayload> {
  const res = await fetch("/api/v1/platform-admin/security", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformSecurityPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Security failed (${res.status})`);
  }
  return body.data;
}

type TabId = "overview" | "authentication" | "security-events" | "access-reviews";

const TABS: readonly { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "security-events", label: "Security Events" },
  { id: "access-reviews", label: "Access Reviews" },
];

export function PlatformAdminSecurityView() {
  const q = useQuery({
    queryKey: ["platform-admin", "security"],
    queryFn: fetchSecurity,
  });
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-security">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Security</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Platform security posture and authentication controls
        </p>
      </div>

      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`rounded px-2.5 py-1.5 text-xs ${
              tab === t.id ? "bg-[var(--color-muted)] font-medium" : "opacity-70"
            }`}
            onClick={() => setTab(t.id)}
            data-testid={`security-tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data && tab === "overview" ? (
        <div className="flex flex-col gap-4" data-testid="security-overview">
          <section>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Authentication
            </h2>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>BetterAuth</span>
                <OpsStatusBadge field={q.data.authentication.health} />
              </li>
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>Active Sessions</span>
                <span title={q.data.authentication.activeSessions.message}>
                  {MetricOrGap(q.data.authentication.activeSessions)}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>MFA Coverage</span>
                <span title={q.data.authentication.mfaCoverage.message}>
                  {MetricOrGap(q.data.authentication.mfaCoverage)}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>Failed Sign-ins — 24h</span>
                <span title={q.data.authentication.failedSignIns24h.message}>
                  {MetricOrGap(q.data.authentication.failedSignIns24h)}
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Access
            </h2>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>Platform Administrators</span>
                <span>{MetricOrGap(q.data.access.platformAdministrators)}</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>Privileged Grants</span>
                <span title={q.data.access.privilegedGrants.message}>
                  {MetricOrGap(q.data.access.privilegedGrants)}
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1">
                <span>Pending Access Reviews</span>
                <span title={q.data.access.pendingAccessReviews.message}>
                  {MetricOrGap(q.data.access.pendingAccessReviews)}
                </span>
              </li>
            </ul>
          </section>

          <section data-testid="security-events-summary">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Security Events
            </h2>
            <ul className="space-y-1 text-xs">
              {(
                [
                  ["High", q.data.securityEvents.high],
                  ["Medium", q.data.securityEvents.medium],
                  ["Low", q.data.securityEvents.low],
                ] as const
              ).map(([label, field]) => (
                <li
                  key={label}
                  className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1"
                >
                  <span>{label}</span>
                  <span title={field.message}>{MetricOrGap(field)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section data-testid="security-attention">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Attention Required
            </h2>
            <ul className="space-y-2 text-xs">
              {q.data.attention.map((item) => (
                <li
                  key={item.title}
                  className="border border-[var(--color-border)] px-2 py-1.5"
                >
                  <p className="font-medium">⚠ {item.title}</p>
                  <p className="text-[var(--color-muted-foreground)]">{item.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </div>
      ) : null}

      {q.data && tab === "authentication" ? (
        <section data-testid="security-authentication" className="text-xs">
          <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Authentication
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Provider</dt>
              <dd>{q.data.authentication.provider}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">
                Platform Admin MFA
              </dt>
              <dd title={q.data.authentication.platformAdminMfa.message}>
                {MetricOrGap(q.data.authentication.platformAdminMfa)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Session Policy</dt>
              <dd title={q.data.authentication.sessionPolicy.message}>
                {MetricOrGap(q.data.authentication.sessionPolicy)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Password Policy</dt>
              <dd title={q.data.authentication.passwordPolicy.message}>
                {MetricOrGap(q.data.authentication.passwordPolicy)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">SSO</dt>
              <dd title={q.data.authentication.sso.message}>
                {MetricOrGap(q.data.authentication.sso)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Trusted Domains</dt>
              <dd title={q.data.authentication.trustedDomains.message}>
                {MetricOrGap(q.data.authentication.trustedDomains)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-[var(--color-muted-foreground)]">
            Read-first surface — no new security-policy engine.
          </p>
        </section>
      ) : null}

      {q.data && tab === "security-events" ? (
        <section data-testid="security-events">
          <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Security Events
          </h2>
          <div className="rounded border border-[var(--color-border)] px-3 py-4 text-xs">
            <p className="font-medium">Not configured</p>
            <p className="mt-1 text-[var(--color-muted-foreground)]">
              {q.data.securityEvents.message}
            </p>
          </div>
        </section>
      ) : null}

      {q.data && tab === "access-reviews" ? (
        <section data-testid="security-access-reviews">
          <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Access Reviews
          </h2>
          <div className="rounded border border-[var(--color-border)] px-3 py-4 text-xs">
            <p className="font-medium">Not configured</p>
            <p className="mt-1 text-[var(--color-muted-foreground)]">
              {q.data.accessReviews.message}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
