"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import type {
  PlatformAuditEventRow,
  PlatformAuditPayload,
} from "@/lib/platform-admin/build-platform-audit";

async function fetchAudit(): Promise<PlatformAuditPayload> {
  const res = await fetch("/api/v1/platform-admin/audit", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: PlatformAuditPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Audit failed (${res.status})`);
  }
  return body.data;
}

type TabId = "platform-audit" | "administrative-changes" | "tenant-access" | "exports";

const TABS: readonly { id: TabId; label: string }[] = [
  { id: "platform-audit", label: "Platform Audit" },
  { id: "administrative-changes", label: "Administrative Changes" },
  { id: "tenant-access", label: "Tenant Access" },
  { id: "exports", label: "Exports" },
];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatStamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AuditInspector({
  event,
  onClose,
}: {
  readonly event: PlatformAuditEventRow;
  readonly onClose: () => void;
}) {
  return (
    <aside
      className="w-full max-w-sm shrink-0 border border-[var(--color-border)] p-3 text-xs lg:w-80"
      data-testid="audit-inspector"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-semibold tracking-wide uppercase">
          Audit Event
        </h2>
        <button
          type="button"
          className="text-[var(--color-muted-foreground)] hover:underline"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <p className="mb-3 font-medium">{event.summary || event.event}</p>
      <dl className="space-y-2">
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Timestamp</dt>
          <dd>{formatStamp(event.occurredAt)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Actor</dt>
          <dd>{event.actor}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Tenant</dt>
          <dd>{event.tenantLabel || "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Area</dt>
          <dd className="capitalize">{event.area}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Event</dt>
          <dd>{event.event}</dd>
        </div>
        {event.correlationId ? (
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Correlation ID</dt>
            <dd className="break-all font-mono text-[11px]">{event.correlationId}</dd>
          </div>
        ) : null}
      </dl>
      {event.detail ? (
        <div className="mt-3 border-t border-[var(--color-border)] pt-2">
          <p className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
            Detail
          </p>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-[11px] text-[var(--color-muted-foreground)]">
            {JSON.stringify(event.detail, null, 2)}
          </pre>
        </div>
      ) : null}
    </aside>
  );
}

function EventsTable({
  events,
  selectedId,
  onSelect,
}: {
  readonly events: readonly PlatformAuditEventRow[];
  readonly selectedId: string | null;
  readonly onSelect: (event: PlatformAuditEventRow) => void;
}) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-[var(--color-muted-foreground)]">
        No audit events available through the APE-Audit facade.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded border border-[var(--color-border)]">
      <table className="w-full min-w-[40rem] border-collapse text-left text-xs">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
          <tr>
            <th className="px-2 py-1.5 font-medium">Time</th>
            <th className="px-2 py-1.5 font-medium">Actor</th>
            <th className="px-2 py-1.5 font-medium">Tenant</th>
            <th className="px-2 py-1.5 font-medium">Area</th>
            <th className="px-2 py-1.5 font-medium">Event</th>
          </tr>
        </thead>
        <tbody>
          {events.map((row) => (
            <tr
              key={row.id}
              className={`cursor-pointer border-b border-[var(--color-border)]/60 ${
                selectedId === row.id
                  ? "bg-[var(--color-muted)]/50"
                  : "hover:bg-[var(--color-muted)]/30"
              }`}
              data-testid={`audit-row-${row.id}`}
              onClick={() => onSelect(row)}
            >
              <td className="px-2 py-1.5">{formatTime(row.occurredAt)}</td>
              <td className="px-2 py-1.5">{row.actor}</td>
              <td className="px-2 py-1.5">{row.tenantLabel || "—"}</td>
              <td className="px-2 py-1.5 capitalize">{row.area}</td>
              <td className="px-2 py-1.5">{row.summary || row.event}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlatformAdminAuditView() {
  const q = useQuery({
    queryKey: ["platform-admin", "audit"],
    queryFn: fetchAudit,
  });
  const [tab, setTab] = useState<TabId>("platform-audit");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PlatformAuditEventRow | null>(null);

  const filtered = useMemo(() => {
    if (!q.data) return [];
    const source =
      tab === "administrative-changes"
        ? q.data.administrativeChanges.events
        : q.data.events;
    const qLower = search.trim().toLowerCase();
    if (!qLower) return [...source];
    return source.filter((e) =>
      `${e.actor} ${e.tenantLabel} ${e.area} ${e.event} ${e.summary}`
        .toLowerCase()
        .includes(qLower),
    );
  }, [q.data, tab, search]);

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-audit">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Audit</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Platform-wide administrative and security activity
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
            onClick={() => {
              setTab(t.id);
              setSelected(null);
            }}
            data-testid={`audit-tab-${t.id}`}
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

      {q.data && (tab === "platform-audit" || tab === "administrative-changes") ? (
        <div className="flex flex-col gap-3 lg:flex-row">
          <section className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <label className="relative flex min-w-[12rem] flex-1 items-center gap-1.5 rounded border border-[var(--color-border)] px-2 py-1">
                <Search className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events…"
                  className="w-full bg-transparent text-xs outline-none"
                  data-testid="audit-search"
                />
              </label>
              <button
                type="button"
                disabled
                title={q.data.exports.message}
                className="rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
                data-testid="audit-export"
                data-availability="not_configured"
              >
                Export
              </button>
            </div>
            <p
              className="mb-2 text-[11px] text-[var(--color-muted-foreground)]"
              data-testid="audit-feed"
              data-availability={
                tab === "administrative-changes"
                  ? q.data.administrativeChanges.availability
                  : q.data.feed.availability
              }
              title={
                tab === "administrative-changes"
                  ? q.data.administrativeChanges.message
                  : q.data.feed.message
              }
            >
              Feed: {q.data.feed.engineId} ·{" "}
              {tab === "administrative-changes"
                ? q.data.administrativeChanges.availability
                : q.data.feed.availability}
            </p>
            <EventsTable
              events={filtered}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          </section>
          {selected ? (
            <AuditInspector event={selected} onClose={() => setSelected(null)} />
          ) : null}
        </div>
      ) : null}

      {q.data && tab === "tenant-access" ? (
        <section data-testid="audit-tenant-access">
          <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Tenant Access
          </h2>
          <div className="rounded border border-[var(--color-border)] px-3 py-4 text-xs">
            <p className="font-medium">Not configured</p>
            <p className="mt-1 text-[var(--color-muted-foreground)]">
              {q.data.tenantAccess.message}
            </p>
          </div>
        </section>
      ) : null}

      {q.data && tab === "exports" ? (
        <section data-testid="audit-exports">
          <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Audit Exports
          </h2>
          <div className="rounded border border-[var(--color-border)] px-3 py-4 text-xs">
            <p className="font-medium">Not configured</p>
            <p className="mt-1 text-[var(--color-muted-foreground)]">
              {q.data.exports.message}
            </p>
          </div>
        </section>
      ) : null}

      {q.data ? (
        <p className="text-[11px] text-[var(--color-muted-foreground)]">
          {q.data.note}
        </p>
      ) : null}
    </div>
  );
}
