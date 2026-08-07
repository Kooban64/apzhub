"use client";

import { cn } from "@apzhub/ui";
import { useEffect, useRef } from "react";

import type {
  KnowledgeOverlayEmptyState,
  KnowledgeOverlayErrorState,
  KnowledgeOverlayGroup,
  KnowledgeOverlayLoadingState,
  KnowledgeOverlayDiagnostics,
} from "./types";
import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeQueryStatus } from "@apzhub/knowledge-discovery-framework/react";

export interface KnowledgeOverlayProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly groups: readonly KnowledgeOverlayGroup[];
  readonly queryStatus: KnowledgeQueryStatus;
  readonly registryReady?: boolean;
  readonly errorMessage?: string;
  readonly onSelectDocument: (document: KnowledgeDocument) => void;
  readonly diagnostics?: KnowledgeOverlayDiagnostics;
  readonly emptyState?: KnowledgeOverlayEmptyState;
  readonly loadingState?: KnowledgeOverlayLoadingState;
  readonly errorState?: KnowledgeOverlayErrorState;
  readonly title?: string;
}

function resolveItemGlyph(item: KnowledgeOverlayGroup["items"][number]): string {
  if (item.icon && item.icon.length === 1) {
    return item.icon;
  }

  return item.title.charAt(0).toUpperCase();
}

function KnowledgeOverlayIcon({
  item,
}: {
  readonly item: KnowledgeOverlayGroup["items"][number];
}) {
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-muted)] text-xs font-semibold text-[var(--color-muted-foreground)]"
    >
      {resolveItemGlyph(item)}
    </span>
  );
}

function KnowledgeOverlayEmptyPanel({
  state,
}: {
  readonly state: KnowledgeOverlayEmptyState;
}) {
  return (
    <li
      className="px-3 py-8 text-center"
      role="status"
      data-testid="knowledge-overlay-empty"
    >
      <p className="text-sm font-medium text-[var(--color-foreground)]">
        {state.title}
      </p>
      {state.description ? (
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          {state.description}
        </p>
      ) : null}
    </li>
  );
}

function KnowledgeOverlayLoadingPanel({
  state,
}: {
  readonly state: KnowledgeOverlayLoadingState;
}) {
  return (
    <li
      className="flex flex-col items-center gap-2 px-3 py-8 text-center"
      role="status"
      aria-live="polite"
      data-testid="knowledge-overlay-loading"
    >
      <span
        aria-hidden
        className="inline-flex h-5 w-5 animate-pulse rounded-full bg-[var(--color-muted-foreground)] opacity-40"
      />
      <p className="text-sm font-medium text-[var(--color-foreground)]">
        {state.message}
      </p>
      {state.description ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {state.description}
        </p>
      ) : null}
    </li>
  );
}

function KnowledgeOverlayErrorPanel({
  state,
}: {
  readonly state: KnowledgeOverlayErrorState;
}) {
  return (
    <li
      className="px-3 py-8 text-center"
      role="alert"
      data-testid="knowledge-overlay-error"
    >
      <p className="text-sm font-medium text-[var(--color-foreground)]">
        {state.title}
      </p>
      {state.description ? (
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          {state.description}
        </p>
      ) : null}
    </li>
  );
}

/**
 * Presentational Knowledge Overlay — grouped knowledge documents only.
 *
 * Does not query providers, register knowledge, execute actions, or navigate.
 * Selection is delegated via {@link KnowledgeOverlayProps.onSelectDocument}.
 */
export function KnowledgeOverlay({
  open,
  onOpenChange,
  query,
  onQueryChange,
  groups,
  queryStatus,
  registryReady = true,
  errorMessage,
  onSelectDocument,
  diagnostics,
  emptyState = {
    title: "No discovery results",
    description: "Try a different search term.",
  },
  loadingState = {
    message: "Searching…",
    description: "Querying registered discovery sources.",
  },
  errorState,
  title = "Knowledge Overlay",
}: KnowledgeOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const showLoading =
    !registryReady ||
    queryStatus === "loading" ||
    (queryStatus === "idle" && query.length > 0);
  const showError = queryStatus === "error";
  const documentCount = groups.reduce((total, group) => total + group.items.length, 0);
  const showEmpty = registryReady && !showLoading && !showError && documentCount === 0;
  const resolvedErrorState: KnowledgeOverlayErrorState = errorState ?? {
    title: "Discovery query failed",
    description: errorMessage ?? "Unable to retrieve discovery results.",
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[color-mix(in_srgb,var(--color-foreground)_25%,transparent)] px-4 pt-[12vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="knowledge-overlay-title"
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
        data-testid="knowledge-overlay"
        data-diagnostics={diagnostics ? "enabled" : undefined}
      >
        <div className="border-b border-[var(--color-border)] px-3 py-2">
          <h2 id="knowledge-overlay-title" className="sr-only">
            {title}
          </h2>
          <input
            ref={inputRef}
            type="search"
            aria-label="Discover"
            placeholder="Discover…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="w-full bg-transparent text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted-foreground)]"
          />
        </div>

        <ul
          role="listbox"
          aria-label="Discovery results"
          className="max-h-80 overflow-y-auto py-1"
          data-testid="knowledge-overlay-list"
        >
          {showLoading ? <KnowledgeOverlayLoadingPanel state={loadingState} /> : null}
          {showError ? <KnowledgeOverlayErrorPanel state={resolvedErrorState} /> : null}
          {showEmpty ? <KnowledgeOverlayEmptyPanel state={emptyState} /> : null}

          {!showLoading && !showError && !showEmpty
            ? groups.map((group, groupIndex) => (
                <li key={group.groupId} role="presentation" className="list-none">
                  <div
                    className={cn(
                      "px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]",
                      groupIndex > 0 && "mt-1 border-t border-[var(--color-border)]",
                    )}
                    data-testid="knowledge-overlay-group"
                    data-group-id={group.groupId}
                    data-group-heading={group.heading}
                  >
                    {group.heading}
                  </div>
                  <ul className="list-none">
                    {group.items.map((item) => (
                      <li key={item.documentId} className="list-none">
                        <button
                          type="button"
                          role="option"
                          aria-label={
                            item.description
                              ? `${item.title}. ${item.description}`
                              : item.title
                          }
                          data-testid="knowledge-overlay-option"
                          data-document-id={item.documentId}
                          data-provider-label={item.providerLabel}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]"
                          onClick={() => onSelectDocument(item.document)}
                        >
                          <KnowledgeOverlayIcon item={item} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{item.title}</div>
                            {item.description ? (
                              <div className="truncate text-xs text-[var(--color-muted-foreground)]">
                                {item.description}
                              </div>
                            ) : null}
                            <div className="truncate text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                              {item.providerLabel}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            : null}
        </ul>
      </div>
    </div>
  );
}
