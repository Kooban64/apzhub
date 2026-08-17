"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { MetricOrGap } from "@/components/platform-admin/ops-status-badge";
import type { OrganisationAdminHomePayload } from "@/lib/organisation-admin/build-home";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";

async function fetchHome(): Promise<OrganisationAdminHomePayload> {
  const res = await fetch("/api/v1/organisation-admin/home", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: OrganisationAdminHomePayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Home failed (${res.status})`);
  }
  return body.data;
}

export function OrganisationAdminHomeView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "home"],
    queryFn: fetchHome,
  });

  return (
    <div className="flex flex-col gap-4 p-4" data-testid="organisation-admin-home">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {q.data?.tenant.name ?? "Organisation"}
        </h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Organisation Admin · Administration
        </p>
      </div>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data ? (
        <>
          <section data-testid="org-admin-organisation-metrics">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Organisation
            </h2>
            <dl className="grid gap-2 text-xs sm:grid-cols-4">
              {(
                [
                  ["People", q.data.organisation.people],
                  ["Teams", q.data.organisation.teams],
                  ["Administrators", q.data.organisation.administrators],
                  ["Pending", q.data.organisation.pending],
                ] as const
              ).map(([label, field]) => (
                <div
                  key={label}
                  className="flex justify-between gap-2 border border-[var(--color-border)] px-2 py-1.5"
                >
                  <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
                  <dd title={field.message}>{MetricOrGap(field)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section data-testid="org-admin-products">
              <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                Products
              </h2>
              {q.data.products.rows.length === 0 ? (
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {q.data.products.message}
                </p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {q.data.products.rows.map((row) => (
                    <li
                      key={row.productKey}
                      className="flex justify-between border-b border-[var(--color-border)]/60 py-1"
                    >
                      <span className="font-mono text-[11px]">{row.productKey}</span>
                      <span className="capitalize">{row.status.replace("_", " ")}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[11px]">
                <Link
                  href={q.data.products.href}
                  className="text-[var(--color-primary)] hover:underline"
                  data-availability="not_configured"
                >
                  View Products →
                </Link>
              </p>
            </section>

            <section data-testid="org-admin-access">
              <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
                Access
              </h2>
              <ul className="space-y-1 text-xs">
                {(
                  [
                    ["Users requiring access", q.data.access.usersRequiringAccess],
                    ["Provisioning issues", q.data.access.provisioningIssues],
                    [
                      "Expiring professional access",
                      q.data.access.expiringProfessionalAccess,
                    ],
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
              <p className="mt-2 text-[11px]">
                <Link
                  href={q.data.access.href}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Review Access →
                </Link>
              </p>
            </section>
          </div>

          <section data-testid="org-admin-attention">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Attention Required
            </h2>
            <div className="rounded border border-[var(--color-border)] px-3 py-3 text-xs">
              <p className="font-medium">Not configured</p>
              <p className="mt-1 text-[var(--color-muted-foreground)]">
                {q.data.attention.message}
              </p>
            </div>
          </section>

          <section data-testid="org-admin-activity">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Recent Administrative Activity
            </h2>
            <div className="rounded border border-[var(--color-border)] px-3 py-3 text-xs">
              <p className="font-medium">Not configured</p>
              <p className="mt-1 text-[var(--color-muted-foreground)]">
                {q.data.recentActivity.message}
              </p>
            </div>
          </section>

          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}{" "}
            <Link
              href={`${ORGANISATION_ADMIN_BASE}/people`}
              className="text-[var(--color-primary)] hover:underline"
            >
              Open People
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}
