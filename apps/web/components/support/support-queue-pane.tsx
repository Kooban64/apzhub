"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { shouldRetrySupportQuery } from "@/lib/support/errors";
import { supportQueryKeys } from "@/lib/support/query-keys";
import { supportRequestDetailPath } from "@/lib/support/routes";
import { listSupportRequests } from "@/lib/support/support-api";

import { StatusBadge } from "./support-ui";

/**
 * Compact queue column for Stream 4 three-pane Support workspace.
 */
export function SupportQueuePane({
  activeRequestId,
}: {
  readonly activeRequestId?: string;
}) {
  const inboxQuery = useQuery({
    queryKey: supportQueryKeys.requests.list({ perPage: 30, page: 1 }),
    queryFn: ({ signal }) => listSupportRequests({ perPage: 30, page: 1 }, { signal }),
    retry: shouldRetrySupportQuery,
  });

  const items = inboxQuery.data?.data ?? [];

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--color-muted-foreground)] uppercase">
        Queue
      </p>
      {inboxQuery.isPending && items.length === 0 ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {items.length === 0 && !inboxQuery.isPending ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">No open requests</p>
      ) : null}
      <ul className="space-y-1" data-testid="support-queue-list">
        {items.map((item) => {
          const active = item.id === activeRequestId;
          const label = item.displayId ?? item.id.slice(0, 8);
          return (
            <li key={item.id}>
              <Link
                href={supportRequestDetailPath(item.id)}
                className={`block rounded-md border px-2 py-2 text-left transition-colors ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-accent)]/40"
                    : "border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-muted)]/40"
                }`}
                data-testid={`support-queue-item-${item.id}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="block truncate text-xs font-medium">{label}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--color-muted-foreground)]">
                  {item.title}
                </span>
                <span className="mt-1 block">
                  <StatusBadge status={item.status} priority={item.priority} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
