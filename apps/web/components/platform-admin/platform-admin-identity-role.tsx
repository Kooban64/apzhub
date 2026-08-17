"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import type { PlatformRoleDetailPayload } from "@/lib/platform-admin/build-platform-identity";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

async function fetchRole(roleId: string): Promise<PlatformRoleDetailPayload> {
  const res = await fetch(
    `/api/v1/platform-admin/identity-access/roles/${encodeURIComponent(roleId)}`,
    { cache: "no-store" },
  );
  const body = (await res.json()) as {
    data?: PlatformRoleDetailPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Role detail failed (${res.status})`);
  }
  return body.data;
}

export function PlatformAdminIdentityRoleDetail({
  roleId,
}: {
  readonly roleId: string;
}) {
  const q = useQuery({
    queryKey: ["platform-admin", "identity-role", roleId],
    queryFn: () => fetchRole(roleId),
  });

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-identity-role">
      <Link
        href={`${PLATFORM_ADMIN_BASE}/identity-access`}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        ← Identity & Access
      </Link>

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
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{q.data.name}</h1>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {q.data.description}
            </p>
          </div>

          <section data-testid="role-members">
            <h2 className="mb-1 text-[11px] font-semibold tracking-wide uppercase">
              Members
            </h2>
            <p className="mb-2 text-xs">{q.data.memberCount}</p>
            {q.data.members.length === 0 ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                No active platform-scope assignments for this role.
              </p>
            ) : (
              <ul className="space-y-1 text-xs">
                {q.data.members.map((m) => (
                  <li key={m.userId}>
                    {m.displayName}
                    <span className="text-[var(--color-muted-foreground)]">
                      {" "}
                      · {m.email}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <hr className="border-[var(--color-border)]" />

          <section data-testid="role-capabilities">
            <h2 className="mb-2 text-[11px] font-semibold tracking-wide uppercase">
              Capabilities
            </h2>
            <ul className="grid gap-1 text-xs sm:grid-cols-2">
              {q.data.capabilities.map((cap) => (
                <li
                  key={cap.label}
                  className="flex justify-between gap-4 border-b border-[var(--color-border)]/60 py-1"
                  data-testid={`role-cap-${cap.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span>{cap.label}</span>
                  <span
                    className={
                      cap.access === "No Access" || cap.access === "No implied access"
                        ? "text-[var(--color-muted-foreground)]"
                        : ""
                    }
                  >
                    {cap.access}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </>
      ) : null}
    </div>
  );
}
