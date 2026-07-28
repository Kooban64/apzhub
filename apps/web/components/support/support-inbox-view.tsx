"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { isSupportApiError, shouldRetrySupportQuery } from "@/lib/support/errors";
import { formatSupportDate } from "@/lib/support/format";
import {
  canCreateSupportRequest,
  type SupportPermissionSource,
} from "@/lib/support/permissions";
import { supportQueryKeys } from "@/lib/support/query-keys";
import {
  supportRequestCreatePath,
  supportRequestDetailPath,
} from "@/lib/support/routes";
import { listSupportRequests } from "@/lib/support/support-api";
import type {
  SupportRequestListParams,
  SupportRequestPriority,
  SupportRequestStatus,
} from "@/lib/support/types";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  SupportTable,
} from "./support-ui";

const STATUSES: readonly SupportRequestStatus[] = [
  "new",
  "open",
  "pending",
  "closed",
  "merged",
  "unknown",
];
const PRIORITIES: readonly SupportRequestPriority[] = [
  "low",
  "normal",
  "high",
  "urgent",
];

function readParams(searchParams: URLSearchParams): SupportRequestListParams {
  const status = searchParams.get("status") as SupportRequestStatus | null;
  const priority = searchParams.get("priority") as SupportRequestPriority | null;
  return {
    status: status && STATUSES.includes(status) ? status : undefined,
    priority: priority && PRIORITIES.includes(priority) ? priority : undefined,
    search: searchParams.get("search") ?? undefined,
    organizationId: searchParams.get("organizationId") ?? undefined,
    groupId: searchParams.get("groupId") ?? undefined,
    ownerId: searchParams.get("ownerId") ?? undefined,
    customerId: searchParams.get("customerId") ?? undefined,
    sort: searchParams.get("sort") ?? "updatedAt",
    order: (searchParams.get("order") as "asc" | "desc" | null) ?? "desc",
    page: Number(searchParams.get("page") ?? "1") || 1,
    perPage: Number(searchParams.get("perPage") ?? "20") || 20,
  };
}

export function SupportInboxView({
  permissions,
}: {
  readonly permissions?: SupportPermissionSource;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => readParams(searchParams), [searchParams]);

  const query = useQuery({
    queryKey: supportQueryKeys.requests.list(params),
    queryFn: ({ signal }) => listSupportRequests(params, { signal }),
    retry: shouldRetrySupportQuery,
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const canCreate = canCreateSupportRequest(permissions);

  return (
    <PageShell
      title="Requests"
      description="Support request inbox with filters and pagination."
      actions={
        canCreate ? (
          <Button
            type="button"
            size="sm"
            onClick={() => router.push(supportRequestCreatePath())}
            data-testid="support-inbox-create"
          >
            New request
          </Button>
        ) : null
      }
    >
      <div
        className="grid gap-3 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-3 lg:grid-cols-4"
        data-testid="support-inbox-filters"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Status</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={params.status ?? ""}
            onChange={(event) => updateParam("status", event.target.value)}
            data-testid="support-filter-status"
          >
            <option value="">All</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Priority</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={params.priority ?? ""}
            onChange={(event) => updateParam("priority", event.target.value)}
            data-testid="support-filter-priority"
          >
            <option value="">All</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Search"
          value={params.search ?? ""}
          onChange={(event) => updateParam("search", event.target.value)}
          data-testid="support-filter-search"
        />
        <Input
          label="Organization ID"
          value={params.organizationId ?? ""}
          onChange={(event) => updateParam("organizationId", event.target.value)}
        />
        <Input
          label="Group ID"
          value={params.groupId ?? ""}
          onChange={(event) => updateParam("groupId", event.target.value)}
        />
        <Input
          label="Owner ID"
          value={params.ownerId ?? ""}
          onChange={(event) => updateParam("ownerId", event.target.value)}
        />
        <Input
          label="Customer ID"
          value={params.customerId ?? ""}
          onChange={(event) => updateParam("customerId", event.target.value)}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Sort</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={params.sort ?? "updatedAt"}
            onChange={(event) => updateParam("sort", event.target.value)}
            data-testid="support-filter-sort"
          >
            <option value="updatedAt">Updated</option>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="displayId">Number</option>
          </select>
        </label>
      </div>

      {query.isPending ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isSupportApiError(query.error)
              ? query.error.message
              : "Failed to load support requests."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && query.data.data.length === 0 ? (
        <EmptyState
          title="No support requests"
          description="Adjust filters or create a new request."
        />
      ) : null}
      {query.isSuccess && query.data.data.length > 0 ? (
        <>
          <SupportTable
            columns={["Number", "Title", "Status / Priority", "Updated"]}
            rows={query.data.data.map((item) => ({
              id: item.id,
              cells: [
                item.displayId ?? item.id,
                item.title,
                <StatusBadge
                  key="badge"
                  status={item.status}
                  priority={item.priority}
                />,
                formatSupportDate(item.updatedAt),
              ],
            }))}
            onRowClick={(id) => router.push(supportRequestDetailPath(id))}
          />
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(params.page ?? 1) <= 1}
              onClick={() => updateParam("page", String((params.page ?? 1) - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Page {params.page ?? 1}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!query.data.page.hasMore}
              onClick={() => updateParam("page", String((params.page ?? 1) + 1))}
              data-testid="support-inbox-next"
            >
              Next
            </Button>
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
