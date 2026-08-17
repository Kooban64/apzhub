"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminPageHeader,
  OrgAdminSecondaryTabs,
  OrgAdminStatusDot,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminProductsPayload } from "@/lib/organisation-admin/build-products";

async function fetchProducts(): Promise<OrganisationAdminProductsPayload> {
  const res = await fetch("/api/v1/organisation-admin/products", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: OrganisationAdminProductsPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Products failed (${res.status})`);
  }
  return body.data;
}

type FilterId = "all" | "QUALITY" | "SECURITY" | "PRODUCTIVITY";

const TAGLINES: Record<string, string> = {
  qa: "Quality Engineering Platform",
  pentest: "Penetration Testing & Security Assurance",
  productivity: "Productivity Platform",
};

function statusTone(status: string): "ok" | "neutral" {
  return status === "active" ? "ok" : "neutral";
}

function statusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "not_subscribed":
      return "Not subscribed";
    case "coming_soon":
      return "Coming soon";
    default:
      return status;
  }
}

export function OrganisationAdminProductsView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "products"],
    queryFn: fetchProducts,
  });
  const [filter, setFilter] = useState<FilterId>("all");

  const suites = useMemo(() => {
    if (!q.data) return [];
    if (filter === "all") return q.data.suites;
    return q.data.suites.filter((s) => s.section === filter);
  }, [q.data, filter]);

  const bySection = useMemo(() => {
    const map = new Map<string, typeof suites>();
    for (const suite of suites) {
      const list = map.get(suite.section) ?? [];
      map.set(suite.section, [...list, suite]);
    }
    return [...map.entries()];
  }, [suites]);

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-products"
    >
      <OrgAdminPageHeader
        title="Products"
        subtitle={`Products available to ${q.data?.tenant.name ?? "this organisation"}`}
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-products-filter"
        value={filter}
        onChange={setFilter}
        tabs={[
          { id: "all", label: "All" },
          { id: "QUALITY", label: "Quality" },
          { id: "SECURITY", label: "Security" },
          { id: "PRODUCTIVITY", label: "Productivity" },
        ]}
      />

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data
        ? bySection.map(([section, sectionSuites]) => (
            <section
              key={section}
              className="pt-2"
              data-testid={`org-admin-products-section-${section}`}
            >
              <h2 className="mb-3 text-[11px] font-semibold tracking-wide uppercase">
                {section}
              </h2>
              <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {sectionSuites.map((suite) => (
                  <article
                    key={suite.suiteId}
                    className="py-4"
                    data-testid={`org-admin-product-${suite.suiteId}`}
                    data-subscribed={suite.status === "active" ? "true" : "false"}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold tracking-tight">
                          {suite.brand}
                        </h3>
                        <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                          {TAGLINES[suite.suiteId] ?? ""}
                        </p>
                      </div>
                      <OrgAdminStatusDot
                        label={statusLabel(suite.status)}
                        tone={statusTone(suite.status)}
                      />
                    </div>

                    <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-xs">
                      <div className="flex gap-2">
                        <dt className="text-[var(--color-muted-foreground)]">
                          Assigned users
                        </dt>
                        <dd className="font-medium">{suite.assignedUsers}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-[var(--color-muted-foreground)]">
                          Assigned teams
                        </dt>
                        <dd className="font-medium text-[var(--color-muted-foreground)]">
                          —
                        </dd>
                      </div>
                    </dl>

                    {suite.suiteId === "productivity" ? (
                      <ul className="mt-3 grid max-w-xl gap-x-8 gap-y-1 text-xs sm:grid-cols-2">
                        {suite.capabilities.map((c) => (
                          <li key={c.productKey} className="flex justify-between gap-4">
                            <span>{c.label}</span>
                            <span
                              className={
                                c.enabled ? "" : "text-[var(--color-muted-foreground)]"
                              }
                            >
                              {c.enabled ? "Enabled" : "Not subscribed"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <p className="mt-3 text-xs">
                      <Link
                        href={suite.href}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        Manage Access →
                      </Link>
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))
        : null}
    </div>
  );
}
