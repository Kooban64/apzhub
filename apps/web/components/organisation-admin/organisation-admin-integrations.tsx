"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminPageHeader,
  OrgAdminSecondaryTabs,
  OrgAdminSectionTitle,
  OrgAdminStatusDot,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminIntegrationsPayload } from "@/lib/organisation-admin/build-integrations";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";

async function fetchIntegrations(): Promise<OrganisationAdminIntegrationsPayload> {
  const res = await fetch("/api/v1/organisation-admin/integrations", {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: OrganisationAdminIntegrationsPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Integrations failed (${res.status})`);
  }
  return body.data;
}

type FilterId = "all" | "connected" | "available" | "issues";

export function OrganisationAdminIntegrationsView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "integrations"],
    queryFn: fetchIntegrations,
  });
  const [filter, setFilter] = useState<FilterId>("all");

  const items = useMemo(() => {
    if (!q.data) return [];
    // All catalogue items are currently not_configured — filters stay honest.
    if (filter === "connected" || filter === "issues") return [];
    return q.data.integrations;
  }, [q.data, filter]);

  const bySection = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const list = map.get(item.section) ?? [];
      map.set(item.section, [...list, item]);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-integrations"
    >
      <OrgAdminPageHeader
        title="Integrations"
        subtitle={`Connections available to ${q.data?.tenant.name ?? "this organisation"}`}
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-integrations-filter"
        value={filter}
        onChange={setFilter}
        tabs={[
          { id: "all", label: "All" },
          { id: "connected", label: "Connected" },
          { id: "available", label: "Available" },
          { id: "issues", label: "Issues" },
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

      {q.data && items.length === 0 ? (
        <p className="py-4 text-xs text-[var(--color-muted-foreground)]">
          No integrations match this filter.
        </p>
      ) : null}

      {q.data
        ? bySection.map(([section, sectionItems]) => (
            <section key={section} className="pt-2">
              <OrgAdminSectionTitle>{section}</OrgAdminSectionTitle>
              <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {sectionItems.map((item) => (
                  <article
                    key={item.id}
                    className="py-4"
                    data-testid={`org-admin-integration-${item.id}`}
                    data-status={item.status}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-xs">
                        <OrgAdminStatusDot label="Not configured" tone="neutral" />
                        <Link
                          href={`${ORGANISATION_ADMIN_BASE}/integrations/${encodeURIComponent(item.id)}`}
                          className="text-xs underline-offset-2 hover:underline"
                        >
                          Configure →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        : null}

      {q.data ? (
        <p className="max-w-2xl text-[11px] text-[var(--color-muted-foreground)]">
          {q.data.note}
        </p>
      ) : null}
    </div>
  );
}
