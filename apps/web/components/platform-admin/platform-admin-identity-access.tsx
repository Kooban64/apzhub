"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { MetricOrGap } from "@/components/platform-admin/ops-status-badge";
import type {
  PlatformAdminSessionRow,
  PlatformAdministratorRow,
  PlatformIdentityAccessPayload,
} from "@/lib/platform-admin/build-platform-identity";

async function fetchIdentity(): Promise<PlatformIdentityAccessPayload> {
  const res = await fetch("/api/v1/platform-admin/identity-access", {
    cache: "no-store",
  });
  const body = (await res.json()) as {
    data?: PlatformIdentityAccessPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Identity failed (${res.status})`);
  }
  return body.data;
}

type TabId =
  "platform-administrators" | "platform-roles" | "privileged-access" | "sessions";

const TABS: readonly { id: TabId; label: string }[] = [
  { id: "platform-administrators", label: "Platform Administrators" },
  { id: "platform-roles", label: "Platform Roles" },
  { id: "privileged-access", label: "Privileged Access" },
  { id: "sessions", label: "Sessions" },
];

function formatClock(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function SessionInspector({
  session,
  onClose,
  onRevoked,
}: {
  readonly session: PlatformAdminSessionRow;
  readonly onClose: () => void;
  readonly onRevoked: () => void;
}) {
  const revoke = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        "/api/v1/platform-admin/identity-access/sessions/revoke",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.userId,
            sessionId: session.sessionId,
          }),
        },
      );
      const body = (await res.json()) as {
        data?: { revoked: boolean };
        error?: { message?: string };
      };
      if (!res.ok || !body.data?.revoked) {
        throw new Error(body.error?.message ?? "Revoke failed");
      }
      return body.data;
    },
    onSuccess: () => onRevoked(),
  });

  return (
    <aside
      className="w-full max-w-sm shrink-0 border border-[var(--color-border)] p-3 text-xs lg:w-80"
      data-testid="session-inspector"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-semibold tracking-wide uppercase">Session</h2>
        <button
          type="button"
          className="text-[var(--color-muted-foreground)] hover:underline"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <dl className="space-y-2">
        <div>
          <dt className="text-[var(--color-muted-foreground)]">User</dt>
          <dd>{session.displayName}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Context</dt>
          <dd>Platform Administration</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Created</dt>
          <dd>{formatClock(session.startedAt)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Last Active</dt>
          <dd>{formatClock(session.lastActive)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">IP</dt>
          <dd title={!session.ipAddress ? "Not captured" : undefined}>
            {session.ipAddress ?? "Unavailable"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Device</dt>
          <dd
            className="break-all"
            title={!session.userAgent ? "Not captured" : undefined}
          >
            {session.userAgent ?? "Unavailable"}
          </dd>
        </div>
      </dl>
      <button
        type="button"
        className="mt-4 w-full rounded border border-[var(--color-border)] px-2 py-1.5 text-xs hover:bg-[var(--color-muted)]"
        data-testid="session-revoke"
        disabled={revoke.isPending}
        onClick={() => revoke.mutate()}
      >
        {revoke.isPending ? "Revoking…" : "Revoke Session"}
      </button>
      {revoke.isError ? (
        <p className="mt-2 text-[var(--color-destructive)]" role="alert">
          {(revoke.error as Error).message}
        </p>
      ) : null}
    </aside>
  );
}

export function PlatformAdminIdentityAccessView() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["platform-admin", "identity-access"],
    queryFn: fetchIdentity,
  });
  const [tab, setTab] = useState<TabId>("platform-administrators");
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] =
    useState<PlatformAdminSessionRow | null>(null);

  const admins = useMemo(() => {
    if (!q.data) return [];
    const qLower = search.trim().toLowerCase();
    return q.data.administrators.filter((row: PlatformAdministratorRow) => {
      if (!qLower) return true;
      return `${row.displayName} ${row.email} ${row.platformRole}`
        .toLowerCase()
        .includes(qLower);
    });
  }, [q.data, search]);

  const sessions = useMemo(() => {
    if (!q.data) return [];
    const qLower = search.trim().toLowerCase();
    return q.data.sessions.filter((row) => {
      if (!qLower) return true;
      return `${row.displayName} ${row.email}`.toLowerCase().includes(qLower);
    });
  }, [q.data, search]);

  return (
    <div
      className="flex flex-col gap-3 p-4"
      data-testid="platform-admin-identity-access"
    >
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Identity & Access</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Access to the APZ Platform control plane
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
              setSelectedSession(null);
            }}
            data-testid={`identity-tab-${t.id}`}
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

      {q.data && tab === "platform-administrators" ? (
        <section data-testid="identity-administrators">
          <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Platform Administrators
          </h2>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <label className="relative flex min-w-[12rem] flex-1 items-center gap-1.5 rounded border border-[var(--color-border)] px-2 py-1">
              <Search className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search administrators…"
                className="w-full bg-transparent text-xs outline-none"
                data-testid="identity-admin-search"
              />
            </label>
            <button
              type="button"
              disabled
              title={q.data.addAdministrator.message}
              className="rounded border border-[var(--color-border)] px-2.5 py-1.5 text-xs opacity-50"
              data-testid="identity-add-admin"
              data-availability="not_configured"
            >
              + Add Administrator
            </button>
          </div>
          {admins.length === 0 ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              No platform-scope control-plane administrators found. Org Admins are not
              listed here.
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-[var(--color-border)]">
              <table className="w-full min-w-[40rem] border-collapse text-left text-xs">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="px-2 py-1.5 font-medium">User</th>
                    <th className="px-2 py-1.5 font-medium">Platform Role</th>
                    <th className="px-2 py-1.5 font-medium">MFA</th>
                    <th className="px-2 py-1.5 font-medium">Last Active</th>
                    <th className="px-2 py-1.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((row) => (
                    <tr
                      key={`${row.userId}-${row.roleId}`}
                      className="border-b border-[var(--color-border)]/60"
                      data-testid={`identity-admin-${row.userId}`}
                    >
                      <td className="px-2 py-1.5">
                        <div>{row.displayName}</div>
                        <div className="text-[11px] text-[var(--color-muted-foreground)]">
                          {row.email}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">{row.platformRole}</td>
                      <td className="px-2 py-1.5" title={row.mfa.message}>
                        {MetricOrGap(row.mfa)}
                      </td>
                      <td className="px-2 py-1.5" title={row.lastActive.message}>
                        {MetricOrGap(row.lastActive)}
                      </td>
                      <td className="px-2 py-1.5">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-2 text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </section>
      ) : null}

      {q.data && tab === "platform-roles" ? (
        <section data-testid="identity-roles">
          <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Platform Roles
          </h2>
          <div className="overflow-x-auto rounded border border-[var(--color-border)]">
            <table className="w-full min-w-[36rem] border-collapse text-left text-xs">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Role</th>
                  <th className="px-2 py-1.5 font-medium">Members</th>
                  <th className="px-2 py-1.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {q.data.roles.map((role) => (
                  <tr
                    key={role.roleId}
                    className="border-b border-[var(--color-border)]/60"
                    data-testid={`identity-role-${role.roleId}`}
                  >
                    <td className="px-2 py-1.5">
                      <Link
                        href={role.href}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {role.name}
                      </Link>
                    </td>
                    <td className="px-2 py-1.5">{role.memberCount}</td>
                    <td className="px-2 py-1.5 text-[var(--color-muted-foreground)]">
                      {role.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {q.data && tab === "privileged-access" ? (
        <section data-testid="identity-privileged">
          <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
            Privileged Access
          </h2>
          <div className="rounded border border-[var(--color-border)] px-3 py-4 text-xs">
            <p className="font-medium">Not configured</p>
            <p className="mt-1 text-[var(--color-muted-foreground)]">
              {q.data.privilegedAccess.message}
            </p>
          </div>
        </section>
      ) : null}

      {q.data && tab === "sessions" ? (
        <div
          className="flex flex-col gap-3 lg:flex-row"
          data-testid="identity-sessions"
        >
          <section className="min-w-0 flex-1">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Sessions
            </h2>
            <label className="mb-2 relative flex max-w-sm items-center gap-1.5 rounded border border-[var(--color-border)] px-2 py-1">
              <Search className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user…"
                className="w-full bg-transparent text-xs outline-none"
                data-testid="identity-session-search"
              />
            </label>
            {sessions.length === 0 ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                No active BetterAuth sessions for platform administrators.
              </p>
            ) : (
              <div className="overflow-x-auto rounded border border-[var(--color-border)]">
                <table className="w-full min-w-[36rem] border-collapse text-left text-xs">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 text-[11px] text-[var(--color-muted-foreground)]">
                    <tr>
                      <th className="px-2 py-1.5 font-medium">User</th>
                      <th className="px-2 py-1.5 font-medium">Context</th>
                      <th className="px-2 py-1.5 font-medium">Started</th>
                      <th className="px-2 py-1.5 font-medium">Last Active</th>
                      <th className="px-2 py-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((row) => (
                      <tr
                        key={row.sessionId}
                        className={`cursor-pointer border-b border-[var(--color-border)]/60 ${
                          selectedSession?.sessionId === row.sessionId
                            ? "bg-[var(--color-muted)]/50"
                            : "hover:bg-[var(--color-muted)]/30"
                        }`}
                        data-testid={`identity-session-${row.sessionId}`}
                        onClick={() => setSelectedSession(row)}
                      >
                        <td className="px-2 py-1.5">{row.displayName}</td>
                        <td className="px-2 py-1.5">{row.context}</td>
                        <td className="px-2 py-1.5">{formatClock(row.startedAt)}</td>
                        <td className="px-2 py-1.5">{formatClock(row.lastActive)}</td>
                        <td className="px-2 py-1.5 capitalize">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {selectedSession ? (
            <SessionInspector
              session={selectedSession}
              onClose={() => setSelectedSession(null)}
              onRevoked={() => {
                setSelectedSession(null);
                void qc.invalidateQueries({
                  queryKey: ["platform-admin", "identity-access"],
                });
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
