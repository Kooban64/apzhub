"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type GlobalSearchResult = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly productLabel: string;
  readonly href: string;
};

type GlobalSearchGroup = {
  readonly productId: string;
  readonly productLabel: string;
  readonly results: readonly GlobalSearchResult[];
};

export type GlobalSearchDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly fetchResults?: (query: string) => Promise<readonly GlobalSearchGroup[]>;
  readonly onNavigate?: (href: string) => void;
};

async function defaultFetch(query: string): Promise<readonly GlobalSearchGroup[]> {
  const response = await fetch(
    `/api/v1/platform/search?q=${encodeURIComponent(query)}`,
    {
      credentials: "same-origin",
    },
  );
  if (!response.ok) {
    return [];
  }
  const body = (await response.json()) as {
    data?: { groups?: readonly GlobalSearchGroup[] };
  };
  return body.data?.groups ?? [];
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
  fetchResults = defaultFetch,
  onNavigate,
}: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<readonly GlobalSearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const flat = useMemo(
    () =>
      groups.flatMap((group) =>
        group.results.map((result) => ({
          ...result,
          productLabel: group.productLabel,
        })),
      ),
    [groups],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setGroups([]);
      setActiveIndex(0);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const q = query.trim();
    if (q.length < 2) {
      setGroups([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void fetchResults(q).then((next) => {
        if (!cancelled) {
          setGroups(next);
          setActiveIndex(0);
          setLoading(false);
        }
      });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [fetchResults, open, query]);

  const select = useCallback(
    (href: string) => {
      onOpenChange(false);
      if (onNavigate) {
        onNavigate(href);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.assign(href);
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
      data-testid="global-search-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        data-testid="global-search"
        className="w-full max-w-xl rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg"
      >
        <label className="sr-only" htmlFor="global-search-input">
          Search APZHUB
        </label>
        <input
          id="global-search-input"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects, support, knowledge…"
          className="w-full border-b border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onOpenChange(false);
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) =>
                Math.min(index + 1, Math.max(flat.length - 1, 0)),
              );
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
              return;
            }
            if (event.key === "Enter" && flat[activeIndex]) {
              event.preventDefault();
              select(flat[activeIndex].href);
            }
          }}
        />
        <div
          className="max-h-80 overflow-auto p-2"
          role="listbox"
          aria-label="Search results"
        >
          {loading ? (
            <p className="px-2 py-3 text-sm text-[var(--color-muted-foreground)]">
              Searching…
            </p>
          ) : null}
          {!loading && query.trim().length >= 2 && groups.length === 0 ? (
            <p className="px-2 py-3 text-sm text-[var(--color-muted-foreground)]">
              No results
            </p>
          ) : null}
          {groups.map((group) => (
            <div key={group.productId} className="mb-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                {group.productLabel}
              </p>
              <ul className="space-y-0.5">
                {group.results.map((result) => {
                  const index = flat.findIndex((item) => item.id === result.id);
                  const active = index === activeIndex;
                  return (
                    <li key={result.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`flex w-full flex-col rounded-md px-2 py-2 text-left text-sm ${
                          active
                            ? "bg-[var(--color-muted)]"
                            : "hover:bg-[var(--color-muted)]/60"
                        }`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => select(result.href)}
                      >
                        <span className="font-medium">{result.title}</span>
                        {result.description ? (
                          <span className="line-clamp-1 text-xs text-[var(--color-muted-foreground)]">
                            {result.description}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-t border-[var(--color-border)] px-3 py-2 text-[10px] text-[var(--color-muted-foreground)]">
          Ctrl+K · Enter to open · Esc to close
        </p>
      </div>
    </div>
  );
}
