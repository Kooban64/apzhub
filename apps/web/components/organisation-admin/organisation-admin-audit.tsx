"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminEmptyState,
  OrgAdminFilterBar,
  OrgAdminFieldRow,
  OrgAdminPageHeader,
  OrgAdminSearchInput,
  OrgAdminSecondaryTabs,
  OrgAdminSelect,
  OrgAdminTable,
  OrgAdminTd,
  OrgAdminTh,
} from "@/components/organisation-admin/org-admin-ui";
import type {
  OrganisationAdminAuditEvent,
  OrganisationAdminAuditPayload,
} from "@/lib/organisation-admin/build-audit";

async function fetchAudit(): Promise<OrganisationAdminAuditPayload> {
  const res = await fetch("/api/v1/organisation-admin/audit", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: OrganisationAdminAuditPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Audit failed (${res.status})`);
  }
  return body.data;
}

type TabId = "all" | "people" | "products" | "security";

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function areaMatches(tab: TabId, area: string): boolean {
  const a = area.toLowerCase();
  if (tab === "all") return true;
  if (tab === "people") {
    return /people|access|team|identity|user|member/.test(a);
  }
  if (tab === "products") {
    return /product|entitlement|provision/.test(a);
  }
  if (tab === "security") {
    return /security|auth|session|mfa|sso/.test(a);
  }
  return true;
}

export function OrganisationAdminAuditView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "audit"],
    queryFn: fetchAudit,
  });
  const [tab, setTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<OrganisationAdminAuditEvent | null>(null);

  const events = useMemo(() => {
    if (!q.data) return [];
    const qLower = search.trim().toLowerCase();
    return q.data.events.filter((e) => {
      if (!areaMatches(tab, e.area)) return false;
      if (!qLower) return true;
      const hay = `${e.actor} ${e.area} ${e.event} ${e.summary}`.toLowerCase();
      return hay.includes(qLower);
    });
  }, [q.data, tab, search]);

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-audit"
    >
      <OrgAdminPageHeader
        title="Audit"
        subtitle={`Administrative activity for ${q.data?.tenant.name ?? "this organisation"}`}
      />

      <OrgAdminSecondaryTabs
        testIdPrefix="org-admin-audit-tab"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All Activity" },
          { id: "people", label: "People & Access" },
          { id: "products", label: "Products" },
          { id: "security", label: "Security" },
        ]}
      />

      <OrgAdminFilterBar>
        <OrgAdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search activity…"
          testId="org-admin-audit-search"
        />
        <OrgAdminSelect disabled title="Actor filter">
          <option>Actor ▾</option>
        </OrgAdminSelect>
        <OrgAdminSelect disabled title="Area filter">
          <option>Area ▾</option>
        </OrgAdminSelect>
        <OrgAdminSelect disabled title="Date filter">
          <option>Date ▾</option>
        </OrgAdminSelect>
      </OrgAdminFilterBar>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data && events.length === 0 ? (
        <OrgAdminEmptyState
          title="No activity"
          message={q.data.feed.message}
          testId="org-admin-audit-empty"
        />
      ) : null}

      {q.data && events.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(16rem,20rem)]">
          <OrgAdminTable testId="org-admin-audit-table" minWidth="36rem">
            <thead>
              <tr>
                <OrgAdminTh>Time</OrgAdminTh>
                <OrgAdminTh>Actor</OrgAdminTh>
                <OrgAdminTh>Area</OrgAdminTh>
                <OrgAdminTh>Event</OrgAdminTh>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr
                  key={e.id}
                  className="cursor-pointer hover:bg-[var(--color-muted)]/30"
                  data-testid={`org-admin-audit-row-${e.id}`}
                  onClick={() => setSelected(e)}
                >
                  <OrgAdminTd>{formatTime(e.occurredAt)}</OrgAdminTd>
                  <OrgAdminTd>{e.actor}</OrgAdminTd>
                  <OrgAdminTd>{e.area}</OrgAdminTd>
                  <OrgAdminTd>{e.summary}</OrgAdminTd>
                </tr>
              ))}
            </tbody>
          </OrgAdminTable>

          {selected ? (
            <aside
              className="border border-[var(--color-border)] p-3 text-xs"
              data-testid="org-admin-audit-inspector"
            >
              <p className="text-[11px] font-semibold tracking-wide uppercase">
                Audit Event
              </p>
              <h2 className="mt-2 text-sm font-semibold">{selected.summary}</h2>
              <dl className="mt-3">
                <OrgAdminFieldRow label="Timestamp">
                  {formatTime(selected.occurredAt)}
                </OrgAdminFieldRow>
                <OrgAdminFieldRow label="Actor">{selected.actor}</OrgAdminFieldRow>
                <OrgAdminFieldRow label="Area">{selected.area}</OrgAdminFieldRow>
                <OrgAdminFieldRow label="Event">{selected.event}</OrgAdminFieldRow>
                {selected.correlationId ? (
                  <OrgAdminFieldRow label="Correlation ID">
                    {selected.correlationId}
                  </OrgAdminFieldRow>
                ) : null}
              </dl>
              <p className="mt-3 text-[11px] text-[var(--color-muted-foreground)]">
                Only captured fields are shown. Cross-tenant audit is never available
                here.
              </p>
            </aside>
          ) : null}
        </div>
      ) : null}

      {q.data ? (
        <p className="max-w-2xl text-[11px] text-[var(--color-muted-foreground)]">
          {q.data.note}
        </p>
      ) : null}
    </div>
  );
}
