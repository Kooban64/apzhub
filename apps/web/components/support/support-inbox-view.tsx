"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { isSupportApiError, shouldRetrySupportQuery } from "@/lib/support/errors";
import { formatSupportDate } from "@/lib/support/format";
import {
  canCreateSupportRequest,
  type SupportPermissionSource,
} from "@/lib/support/permissions";
import {
  readOnboardingDismissed,
  writeOnboardingDismissed,
} from "@/lib/support/preferences";
import { supportQueryKeys } from "@/lib/support/query-keys";
import {
  supportHelpPath,
  supportRequestCreatePath,
  supportRequestDetailPath,
  supportSearchPath,
} from "@/lib/support/routes";
import { listSupportRequests } from "@/lib/support/support-api";
import type {
  SupportRequestListParams,
  SupportRequestPriority,
  SupportRequestStatus,
} from "@/lib/support/types";

import {
  ContextSection,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  SupportTable,
  SupportWorkspaceFrame,
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!readOnboardingDismissed());
  }, []);

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
      description="Ask for help, follow progress, and reach resolution in APZ Support."
      breadcrumbs={["APZ Support", "Requests"]}
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
      <SupportWorkspaceFrame
        context={
          <>
            <ContextSection title="Quick actions">
              <div className="flex flex-col gap-2" data-testid="support-quick-actions">
                {canCreate ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.push(supportRequestCreatePath())}
                  >
                    New request
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(supportSearchPath())}
                >
                  Search APZ Support
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(supportHelpPath())}
                >
                  Help & getting started
                </Button>
              </div>
            </ContextSection>
          </>
        }
      >
        {showOnboarding ? (
          <div
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/15 p-4"
            data-testid="support-onboarding"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Welcome to APZ Support</h2>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  One clear place inside APZHUB to ask for help, follow progress,
                  communicate, and reach resolution.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(supportHelpPath())}
                >
                  Open help
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    writeOnboardingDismissed(true);
                    setShowOnboarding(false);
                  }}
                  data-testid="support-onboarding-dismiss"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        ) : null}

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
            label="Organisation"
            value={params.organizationId ?? ""}
            onChange={(event) => updateParam("organizationId", event.target.value)}
          />
          <Input
            label="Group"
            value={params.groupId ?? ""}
            onChange={(event) => updateParam("groupId", event.target.value)}
          />
          <Input
            label="Owner"
            value={params.ownerId ?? ""}
            onChange={(event) => updateParam("ownerId", event.target.value)}
          />
          <Input
            label="Customer"
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
                : "Failed to load requests."
            }
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.isSuccess && query.data.data.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="Create a request when you need help, or adjust filters to find existing work."
            action={
              canCreate ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => router.push(supportRequestCreatePath())}
                  data-testid="support-inbox-empty-create"
                >
                  New request
                </Button>
              ) : null
            }
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
      </SupportWorkspaceFrame>
    </PageShell>
  );
}
