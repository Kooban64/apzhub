"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type GlobalQuickActionItem = {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly productLabel: string;
  readonly href: string;
  readonly recentRank?: number;
};

export type GlobalQuickActionsDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly fetchActions?: () => Promise<readonly GlobalQuickActionItem[]>;
  readonly onNavigate?: (href: string, action: GlobalQuickActionItem) => void;
};

async function defaultFetch(): Promise<readonly GlobalQuickActionItem[]> {
  let recent = "";
  try {
    const recentResponse = await fetch("/api/platform/v1/recent", {
      credentials: "same-origin",
    });
    if (recentResponse.ok) {
      const body = (await recentResponse.json()) as {
        data?: readonly { itemType?: string; itemKey?: string }[];
      };
      recent = (body.data ?? [])
        .filter((item) => item.itemType === "quick-action" && item.itemKey)
        .map((item) => item.itemKey as string)
        .slice(0, 10)
        .join(",");
    }
  } catch {
    /* non-blocking */
  }

  const url = recent
    ? `/api/v1/platform/quick-actions?recent=${encodeURIComponent(recent)}`
    : "/api/v1/platform/quick-actions";
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) {
    return [];
  }
  const body = (await response.json()) as {
    data?: { actions?: readonly GlobalQuickActionItem[] };
  };
  return body.data?.actions ?? [];
}

export function GlobalQuickActionsDialog({
  open,
  onOpenChange,
  fetchActions = defaultFetch,
  onNavigate,
}: GlobalQuickActionsDialogProps) {
  const [actions, setActions] = useState<readonly GlobalQuickActionItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return actions;
    }
    return actions.filter(
      (action) =>
        action.label.toLowerCase().includes(q) ||
        action.productLabel.toLowerCase().includes(q) ||
        (action.description?.toLowerCase().includes(q) ?? false),
    );
  }, [actions, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActions([]);
      setActiveIndex(0);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchActions().then((next) => {
      if (!cancelled) {
        setActions(next);
        setActiveIndex(0);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchActions, open]);

  const select = useCallback(
    (action: GlobalQuickActionItem) => {
      onOpenChange(false);
      void fetch("/api/platform/v1/recent", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          itemType: "quick-action",
          itemKey: action.id,
          label: action.label,
        }),
      }).catch(() => {
        /* non-blocking */
      });
      if (onNavigate) {
        onNavigate(action.href, action);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.assign(action.href);
      }
    },
    [onNavigate, onOpenChange],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh]"
      role="presentation"
      data-testid="global-quick-actions-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick actions"
        data-testid="global-quick-actions"
        className="w-full max-w-xl rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg"
      >
        <label className="sr-only" htmlFor="global-quick-actions-input">
          Filter quick actions
        </label>
        <input
          id="global-quick-actions-input"
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          placeholder="Start work — New Project, Ticket, Time…"
          className="w-full border-b border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onOpenChange(false);
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) =>
                Math.min(index + 1, Math.max(filtered.length - 1, 0)),
              );
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
              return;
            }
            if (event.key === "Enter" && filtered[activeIndex]) {
              event.preventDefault();
              select(filtered[activeIndex]);
            }
          }}
        />
        <div
          className="max-h-80 overflow-auto p-2"
          role="listbox"
          aria-label="Quick actions"
        >
          {loading ? (
            <p className="px-2 py-3 text-sm text-[var(--color-muted-foreground)]">
              Loading actions…
            </p>
          ) : null}
          {!loading && filtered.length === 0 ? (
            <p className="px-2 py-3 text-sm text-[var(--color-muted-foreground)]">
              No actions available
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {filtered.map((action, index) => {
              const active = index === activeIndex;
              const recent = action.recentRank !== undefined;
              return (
                <li key={action.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-testid={`global-quick-action-${action.id}`}
                    className={`flex w-full flex-col rounded-md px-2 py-2 text-left text-sm ${
                      active
                        ? "bg-[var(--color-muted)]"
                        : "hover:bg-[var(--color-muted)]/60"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(action)}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span>+ {action.label}</span>
                      {recent ? (
                        <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                          Recent
                        </span>
                      ) : null}
                    </span>
                    <span className="line-clamp-1 text-xs text-[var(--color-muted-foreground)]">
                      {action.productLabel}
                      {action.description ? ` · ${action.description}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="border-t border-[var(--color-border)] px-3 py-2 text-[10px] text-[var(--color-muted-foreground)]">
          Ctrl+Shift+A · Enter to open · Esc to close
        </p>
      </div>
    </div>
  );
}
