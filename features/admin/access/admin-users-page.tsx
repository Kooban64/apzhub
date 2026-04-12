"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAdminInspector } from "@/features/admin/admin-inspector-context";
import { AccessStatusBadge } from "@/features/admin/access/access-status-badge";
import { RealizationPill } from "@/features/admin/access/realization-pill";
import type { AdminMatrixModel } from "@/lib/admin/access/matrix";
import { type AccessRealizationStatus, realizationStatusSeverity } from "@/lib/admin/access/realization-status";
import { selectDirectoryUser } from "@/lib/admin/admin-inspector-selection";
import { useAdminAccessQuery } from "@/lib/hooks/use-admin-access-query";
import { Button } from "@/components/ui/button";
import { MIN_PASSWORD_LENGTH } from "@/lib/identity/password-policy";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function worstRealizationForUser(matrix: AdminMatrixModel, userId: string): AccessRealizationStatus | null {
  let worst: AccessRealizationStatus | null = null;
  let worstScore = 0;
  for (const c of matrix.cells) {
    if (c.userId !== userId || !c.realizationStatus) {
      continue;
    }
    const score = realizationStatusSeverity(c.realizationStatus);
    if (score > worstScore) {
      worstScore = score;
      worst = c.realizationStatus;
    }
  }
  return worst;
}

function isPersistedPortalUser(id: string): boolean {
  return UUID_RE.test(id);
}

export function AdminUsersPage() {
  const qc = useQueryClient();
  const { setSelection } = useAdminInspector();
  const accessQuery = useAdminAccessQuery();
  const data = accessQuery.data?.accessData;
  const isLoading = accessQuery.isLoading;
  const searchParams = useSearchParams();
  const focus = searchParams.get("focus");
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | "user" | "admin" | "superadmin">("all");
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"user" | "admin" | "superadmin">("user");
  const [createError, setCreateError] = useState<string | null>(null);
  const [pwdUserId, setPwdUserId] = useState<string | null>(null);
  const [pwdValue, setPwdValue] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin" | "superadmin">("user");
  const [editError, setEditError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail.trim(),
          displayName: createName.trim() || createEmail.trim().split("@")[0]!,
          password: createPassword,
          platformRole: createRole,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? `Create failed (${res.status})`);
      }
    },
    onSuccess: async () => {
      setCreateError(null);
      setCreateEmail("");
      setCreateName("");
      setCreatePassword("");
      await qc.invalidateQueries({ queryKey: ["admin-access"] });
    },
    onError: (e: Error) => {
      setCreateError(e.message);
    },
  });

  const statusMut = useMutation({
    mutationFn: async (input: { userId: string; status: "active" | "suspended" }) => {
      const res = await fetch("/api/admin/access/triggers/user-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? `Status ${res.status}`);
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-access"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? `Delete ${res.status}`);
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-access"] });
    },
  });

  const patchMut = useMutation({
    mutationFn: async (input: { userId: string; displayName: string; platformRole: "user" | "admin" | "superadmin" }) => {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(input.userId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: input.displayName, platformRole: input.platformRole }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? `Update ${res.status}`);
      }
    },
    onSuccess: async () => {
      setEditError(null);
      setEditUserId(null);
      await qc.invalidateQueries({ queryKey: ["admin-access"] });
    },
    onError: (e: Error) => {
      setEditError(e.message);
    },
  });

  const passwordMut = useMutation({
    mutationFn: async () => {
      if (!pwdUserId) {
        return;
      }
      const res = await fetch(`/api/admin/users/${encodeURIComponent(pwdUserId)}/password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwdValue }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? `Password ${res.status}`);
      }
    },
    onSuccess: async () => {
      setPwdError(null);
      setPwdUserId(null);
      setPwdValue("");
      await qc.invalidateQueries({ queryKey: ["admin-access"] });
    },
    onError: (e: Error) => {
      setPwdError(e.message);
    },
  });

  const rows = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.directory.users.filter((u) => {
      if (focus && u.id !== focus) {
        return false;
      }
      if (role !== "all" && u.platformRole !== role) {
        return false;
      }
      if (!q.trim()) {
        return true;
      }
      const s = q.toLowerCase();
      return u.displayName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    });
  }, [data, focus, q, role]);

  if (isLoading || !data) {
    return (
      <div className="p-[var(--shell-pad)] text-xs text-muted-foreground" data-testid="admin-users-loading">
        Loading users…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-testid="admin-users-page">
      <header className="border-b border-border pb-2">
        <h1 className="text-lg font-semibold tracking-tight">Users</h1>
        <p className="text-xs text-muted-foreground">
          Directory and portal identity — create users, set passwords, and suspend via access triggers.
        </p>
      </header>

      <section className="rounded-md border border-border bg-muted/20 p-3 text-xs">
        <h2 className="font-semibold text-foreground">Create portal user</h2>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
            Email
            <input
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              className="h-8 w-48 rounded-md border border-input bg-background px-2 font-mono text-[0.65rem]"
              autoComplete="off"
              data-testid="admin-users-create-email"
            />
          </label>
          <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
            Display name
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="h-8 w-40 rounded-md border border-input bg-background px-2"
              data-testid="admin-users-create-name"
            />
          </label>
          <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
            Password ({MIN_PASSWORD_LENGTH}+ chars)
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              className="h-8 w-44 rounded-md border border-input bg-background px-2"
              autoComplete="new-password"
              data-testid="admin-users-create-password"
            />
          </label>
          <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
            Platform role
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as typeof createRole)}
              className="h-8 rounded-md border border-input bg-background px-2"
              data-testid="admin-users-create-role"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="superadmin">superadmin</option>
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            disabled={createMut.isPending}
            onClick={() => createMut.mutate()}
            data-testid="admin-users-create-submit"
          >
            {createMut.isPending ? "Creating…" : "Create"}
          </Button>
        </div>
        {createError ? <p className="mt-2 text-destructive">{createError}</p> : null}
      </section>

      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 w-56 rounded-md border border-input bg-background px-2 text-xs"
            placeholder="Name or email"
            data-testid="admin-users-search"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            data-testid="admin-users-role-filter"
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </label>
      </div>

      {editUserId ? (
        <div className="rounded-md border border-border bg-panel p-3 text-xs" data-testid="admin-users-edit-panel">
          <p className="font-medium">Edit portal user</p>
          <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">{editUserId}</p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
              Display name
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 w-48 rounded-md border border-input bg-background px-2"
              />
            </label>
            <label className="flex flex-col gap-0.5 text-[0.65rem] font-medium text-muted-foreground">
              Platform role
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as typeof editRole)}
                className="h-8 rounded-md border border-input bg-background px-2"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="superadmin">superadmin</option>
              </select>
            </label>
            <Button
              type="button"
              size="sm"
              disabled={patchMut.isPending}
              onClick={() => patchMut.mutate({ userId: editUserId, displayName: editName, platformRole: editRole })}
            >
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditUserId(null)}>
              Cancel
            </Button>
          </div>
          {editError ? <p className="mt-2 text-destructive">{editError}</p> : null}
        </div>
      ) : null}

      {pwdUserId ? (
        <div className="rounded-md border border-border bg-panel p-3 text-xs" data-testid="admin-users-password-panel">
          <p className="font-medium">Set password for user</p>
          <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">{pwdUserId}</p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <input
              type="password"
              value={pwdValue}
              onChange={(e) => setPwdValue(e.target.value)}
              className="h-8 w-56 rounded-md border border-input bg-background px-2"
              placeholder={`New password (${MIN_PASSWORD_LENGTH}+ chars)`}
            />
            <Button type="button" size="sm" disabled={passwordMut.isPending} onClick={() => passwordMut.mutate()}>
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPwdUserId(null)}>
              Cancel
            </Button>
          </div>
          {pwdError ? <p className="mt-2 text-destructive">{pwdError}</p> : null}
        </div>
      ) : null}

      <div className="overflow-auto rounded-md border border-border">
        <table className="w-full min-w-[64rem] text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 font-medium">Name</th>
              <th className="px-2 py-1.5 font-medium">Email</th>
              <th className="px-2 py-1.5 font-medium">Role</th>
              <th className="px-2 py-1.5 font-medium">Status</th>
              <th className="px-2 py-1.5 font-medium">Linked</th>
              <th className="px-2 py-1.5 font-medium">Last login</th>
              <th className="px-2 py-1.5 font-medium">Access</th>
              <th className="px-2 py-1.5 font-medium">Provision</th>
              <th className="px-2 py-1.5 font-medium">Flags</th>
              <th className="px-2 py-1.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    data-testid={`admin-user-row-${u.id}`}
                    className="text-left font-medium text-foreground hover:underline"
                    onClick={() =>
                      setSelection(
                        selectDirectoryUser({
                          userId: u.id,
                          displayName: u.displayName,
                          status: u.status === "suspended" ? "blocked" : "active",
                        }),
                      )
                    }
                  >
                    {u.displayName}
                  </button>
                </td>
                <td className="px-2 py-1.5 font-mono text-[0.65rem] text-muted-foreground">{u.email}</td>
                <td className="px-2 py-1.5 uppercase text-muted-foreground">{u.platformRole}</td>
                <td className="px-2 py-1.5 text-muted-foreground">{u.status}</td>
                <td className="px-2 py-1.5 text-muted-foreground">
                  {u.linkedAccounts.map((l) => `${l.provider}:${l.state}`).join(", ")}
                </td>
                <td className="px-2 py-1.5 font-mono text-[0.6rem] text-muted-foreground">{u.lastLoginAt}</td>
                <td className="px-2 py-1.5">
                  <AccessStatusBadge label={u.accessSummary.label} tone={u.accessSummary.tone} />
                </td>
                <td className="px-2 py-1.5">
                  {(() => {
                    const w = worstRealizationForUser(data.matrix, u.id);
                    return w ? <RealizationPill status={w} /> : <span className="text-muted-foreground">—</span>;
                  })()}
                </td>
                <td className="px-2 py-1.5 text-[0.6rem] text-muted-foreground">
                  {u.issueFlags.length ? u.issueFlags.join(", ") : "—"}
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {u.status === "active" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[0.6rem]"
                        disabled={statusMut.isPending}
                        onClick={() => statusMut.mutate({ userId: u.id, status: "suspended" })}
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[0.6rem]"
                        disabled={statusMut.isPending}
                        onClick={() => statusMut.mutate({ userId: u.id, status: "active" })}
                      >
                        Activate
                      </Button>
                    )}
                    {isPersistedPortalUser(u.id) ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[0.6rem]"
                          onClick={() => {
                            setEditUserId(u.id);
                            setEditName(u.displayName);
                            setEditRole(u.platformRole);
                            setEditError(null);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[0.6rem]"
                          onClick={() => {
                            setPwdUserId(u.id);
                            setPwdValue("");
                            setPwdError(null);
                          }}
                        >
                          Password
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-7 text-[0.6rem]"
                          disabled={deleteMut.isPending}
                          onClick={() => {
                            if (window.confirm(`Delete portal user ${u.email}? This cannot be undone.`)) {
                              deleteMut.mutate(u.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.65rem] text-muted-foreground">{rows.length} users shown</p>
    </div>
  );
}
