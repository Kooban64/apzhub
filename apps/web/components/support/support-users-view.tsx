"use client";

import { Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import { formatSupportDate } from "@/lib/support/format";
import { supportQueryKeys } from "@/lib/support/query-keys";
import { SUPPORT_BASE } from "@/lib/support/routes";
import { getSupportUser, listSupportUsers } from "@/lib/support/support-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  SupportTable,
} from "./support-ui";

export function SupportUsersView({ userId }: { readonly userId?: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const listQuery = useQuery({
    queryKey: supportQueryKeys.users.list({ search: search || undefined }),
    queryFn: ({ signal }) =>
      listSupportUsers({ search: search || undefined, limit: 50 }, { signal }),
    enabled: !userId,
  });

  const detailQuery = useQuery({
    queryKey: supportQueryKeys.users.detail(userId ?? ""),
    queryFn: ({ signal }) => getSupportUser(userId!, { signal }),
    enabled: Boolean(userId),
  });

  if (userId) {
    if (detailQuery.isLoading) return <LoadingState />;
    if (detailQuery.isError || !detailQuery.data) {
      return (
        <ErrorState
          message={
            isSupportApiError(detailQuery.error)
              ? detailQuery.error.message
              : "User not found."
          }
          onRetry={() => void detailQuery.refetch()}
        />
      );
    }
    const user = detailQuery.data.data;
    return (
      <PageShell title={user.displayName} description="Support-domain user (read-only)">
        <div
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 px-3 py-2 text-sm"
          role="note"
          data-testid="support-users-identity-banner"
        >
          These are Support-domain users (agents/customers), not platform identity
          accounts.
        </div>
        <div className="space-y-2 text-sm" data-testid="support-user-detail">
          <p>
            <span className="font-medium">ID:</span> {user.id}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email ?? "—"}
          </p>
          <p>
            <span className="font-medium">Login:</span> {user.login ?? "—"}
          </p>
          <p>
            <span className="font-medium">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-medium">Active:</span> {user.active ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Updated:</span>{" "}
            {formatSupportDate(user.updatedAt)}
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Users"
      description="Read-only Support-domain users. Distinct from platform identity."
    >
      <div
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20 px-3 py-2 text-sm"
        role="note"
        data-testid="support-users-identity-banner"
      >
        These are Support-domain users (agents/customers), not platform identity
        accounts.
      </div>
      <Input
        label="Search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        data-testid="support-users-search"
      />
      {listQuery.isLoading ? <LoadingState /> : null}
      {listQuery.isError ? (
        <ErrorState
          message={
            isSupportApiError(listQuery.error)
              ? listQuery.error.message
              : "Failed to load users."
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : null}
      {listQuery.isSuccess && listQuery.data.data.length === 0 ? (
        <EmptyState title="No users" />
      ) : null}
      {listQuery.data ? (
        <SupportTable
          columns={["Name", "Email", "Role", "Active"]}
          rows={listQuery.data.data.map((user) => ({
            id: user.id,
            cells: [
              user.displayName,
              user.email ?? "—",
              user.role,
              user.active ? "Yes" : "No",
            ],
          }))}
          onRowClick={(id) => router.push(`${SUPPORT_BASE}/users/${id}`)}
        />
      ) : null}
    </PageShell>
  );
}
