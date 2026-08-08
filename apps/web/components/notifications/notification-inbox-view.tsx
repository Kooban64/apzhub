"use client";

/**
 * Unified Notification Centre v1 — delivery inbox SoR + product grouping + deep links.
 */

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getNotificationDeliveryHealth,
  listInAppNotifications,
  markAllInAppNotificationsRead,
  markInAppNotificationRead,
  markInAppNotificationUnread,
  notificationDeliveryQueryKeys,
  type InAppNotificationDto,
} from "@/lib/notifications/notification-delivery-api";
import {
  productLabel,
  resolveNotificationDeepLink,
} from "@/lib/unified-notifications/deep-links";

function formatWhen(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function NotificationInboxView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [productFilter, setProductFilter] = useState<string>("all");
  const [liveState, setLiveState] = useState<"idle" | "live" | "unavailable">("idle");

  const inboxQuery = useQuery({
    queryKey: notificationDeliveryQueryKeys.inbox,
    queryFn: listInAppNotifications,
    refetchInterval: 30_000,
  });

  const healthQuery = useQuery({
    queryKey: notificationDeliveryQueryKeys.health,
    queryFn: getNotificationDeliveryHealth,
    retry: false,
  });

  const markRead = useMutation({
    mutationFn: markInAppNotificationRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationDeliveryQueryKeys.inbox }),
  });
  const markUnread = useMutation({
    mutationFn: markInAppNotificationUnread,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationDeliveryQueryKeys.inbox }),
  });
  const markAll = useMutation({
    mutationFn: markAllInAppNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationDeliveryQueryKeys.inbox }),
  });

  useEffect(() => {
    if (typeof EventSource === "undefined") {
      setLiveState("unavailable");
      return;
    }
    let source: EventSource | undefined;
    try {
      source = new EventSource("/api/v1/realtime/stream?topics=notifications");
      source.addEventListener("realtime.ready", () => setLiveState("live"));
      const invalidate = () => {
        void queryClient.invalidateQueries({
          queryKey: notificationDeliveryQueryKeys.inbox,
        });
      };
      for (const event of [
        "notification.created",
        "notification.updated",
        "notification.read",
        "notification.expired",
      ]) {
        source.addEventListener(event, invalidate);
      }
      source.onerror = () => setLiveState("unavailable");
    } catch {
      setLiveState("unavailable");
    }
    return () => {
      source?.close();
    };
  }, [queryClient]);

  const items = inboxQuery.data ?? [];
  const products = useMemo(() => {
    const set = new Set(items.map((item) => item.sourceProduct));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(
    () =>
      productFilter === "all"
        ? items
        : items.filter((item) => item.sourceProduct === productFilter),
    [items, productFilter],
  );

  const unreadCount = useMemo(
    () => items.filter((item) => !item.readAt).length,
    [items],
  );
  const selected =
    filtered.find((item) => item.id === selectedId) ??
    items.find((item) => item.id === selectedId);

  const deliveryDisabled =
    healthQuery.isError || (healthQuery.data && healthQuery.data.enabled === false);

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="unified-notification-centre">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            APS-Notifications
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            Notification Centre
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Cross-product inbox · unread {unreadCount}
            {liveState === "live" ? " · live" : ""}
            {liveState === "unavailable" ? " · live unavailable" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-[var(--color-muted-foreground)]">
            Product
            <select
              className="ml-2 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value)}
              data-testid="notification-product-filter"
            >
              <option value="all">All</option>
              {products.map((product) => (
                <option key={product} value={product}>
                  {productLabel(product)}
                </option>
              ))}
            </select>
          </label>
          <Link
            href="/workspace/notifications/preferences"
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm hover:bg-[var(--color-muted)]"
          >
            Preferences
          </Link>
          <Button
            type="button"
            variant="outline"
            disabled={markAll.isPending || unreadCount === 0}
            onClick={() => markAll.mutate()}
          >
            Mark all read
          </Button>
        </div>
      </header>

      {deliveryDisabled ? (
        <div
          className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm"
          data-testid="notification-inbox-disabled"
        >
          Notification delivery is disabled or unavailable.
        </div>
      ) : null}

      {inboxQuery.isLoading ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading centre…</p>
      ) : null}
      {inboxQuery.isError ? (
        <p className="text-sm text-red-600" data-testid="notification-inbox-error">
          {(inboxQuery.error as Error).message}
        </p>
      ) : null}

      {!inboxQuery.isLoading && filtered.length === 0 ? (
        <div
          className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
          data-testid="notification-inbox-empty"
        >
          <p className="font-medium">No notifications</p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Cross-product notifications appear here when delivered.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ul className="flex flex-col gap-2" data-testid="notification-inbox-list">
          {filtered.map((item: InAppNotificationDto) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-3 text-left hover:bg-[var(--color-muted)]/40"
                data-testid="notification-inbox-item"
                data-unread={item.readAt ? "false" : "true"}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs uppercase text-[var(--color-muted-foreground)]">
                    {productLabel(item.sourceProduct)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {item.category} · {formatWhen(item.createdAt)}
                  {!item.readAt ? " · unread" : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>

        <div
          className="rounded-lg border border-[var(--color-border)] px-4 py-4"
          data-testid="notification-inbox-detail"
        >
          {!selected ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Select a notification to view details.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">{selected.title}</h2>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                {productLabel(selected.sourceProduct)}
              </p>
              {selected.summary ? <p className="text-sm">{selected.summary}</p> : null}
              {selected.body ? (
                <pre className="overflow-auto rounded bg-[var(--color-muted)]/30 p-3 text-xs">
                  {selected.body}
                </pre>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {selected.readAt ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => markUnread.mutate(selected.id)}
                  >
                    Mark unread
                  </Button>
                ) : (
                  <Button type="button" onClick={() => markRead.mutate(selected.id)}>
                    Mark read
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  data-testid="notification-open-product"
                  onClick={() => {
                    const href = resolveNotificationDeepLink({
                      sourceProduct: selected.sourceProduct,
                      sourceObjectRef: selected.sourceObjectRef,
                    });
                    if (href) {
                      if (!selected.readAt) {
                        markRead.mutate(selected.id);
                      }
                      router.push(href);
                    }
                  }}
                >
                  Open in product
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
