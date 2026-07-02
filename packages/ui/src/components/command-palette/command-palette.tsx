"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { buildCommandPaletteRows } from "./build-palette-rows";
import type {
  CommandPaletteDiagnostics,
  CommandPaletteEmptyState,
  CommandPaletteExecutionFeedback,
  CommandPaletteItem,
  CommandPaletteLoadingState,
} from "./types";

export interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly commands: readonly CommandPaletteItem[];
  readonly onSelect: (commandId: string) => void;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly isReady?: boolean;
  readonly executionFeedback?: CommandPaletteExecutionFeedback | null;
  readonly diagnostics?: CommandPaletteDiagnostics;
  readonly onSelectedIndexChange?: (index: number) => void;
  /** @deprecated Prefer `emptyState`. */
  readonly emptyMessage?: string;
  /** @deprecated Prefer `loadingState`. */
  readonly loadingMessage?: string;
  readonly emptyState?: CommandPaletteEmptyState;
  readonly loadingState?: CommandPaletteLoadingState;
  readonly title?: string;
}

function resolveEmptyState(
  emptyState: CommandPaletteEmptyState | undefined,
  emptyMessage: string,
): CommandPaletteEmptyState {
  return emptyState ?? { title: emptyMessage };
}

function resolveLoadingState(
  loadingState: CommandPaletteLoadingState | undefined,
  loadingMessage: string,
): CommandPaletteLoadingState {
  return loadingState ?? { message: loadingMessage };
}

function resolveCommandGlyph(item: CommandPaletteItem): string {
  if (item.icon && item.icon.length === 1) {
    return item.icon;
  }

  return item.label.charAt(0).toUpperCase();
}

function CommandPaletteIcon({ item }: { readonly item: CommandPaletteItem }) {
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-muted)] text-xs font-semibold text-[var(--color-muted-foreground)]"
    >
      {resolveCommandGlyph(item)}
    </span>
  );
}

function CommandPaletteShortcut({ shortcut }: { readonly shortcut: string }) {
  return (
    <kbd
      className="hidden shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-muted-foreground)] sm:inline-block"
      aria-label={`Shortcut ${shortcut}`}
    >
      {shortcut}
    </kbd>
  );
}

function CommandPaletteEmptyPanel({
  state,
}: {
  readonly state: CommandPaletteEmptyState;
}) {
  return (
    <li
      className="px-3 py-8 text-center"
      role="status"
      data-testid="command-palette-empty"
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

function CommandPaletteLoadingPanel({
  state,
}: {
  readonly state: CommandPaletteLoadingState;
}) {
  return (
    <li
      className="flex flex-col items-center gap-2 px-3 py-8 text-center"
      role="status"
      aria-live="polite"
      data-testid="command-palette-loading"
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

export function CommandPalette({
  open,
  onOpenChange,
  commands,
  onSelect,
  query,
  onQueryChange,
  isReady = true,
  executionFeedback = null,
  diagnostics,
  onSelectedIndexChange,
  emptyMessage = "No commands available",
  loadingMessage = "Loading commands…",
  emptyState,
  loadingState,
  title = "Command Palette",
}: CommandPaletteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const layout = React.useMemo(() => buildCommandPaletteRows(commands), [commands]);
  const { rows, selectableItems } = layout;
  const resolvedEmptyState = resolveEmptyState(emptyState, emptyMessage);
  const resolvedLoadingState = resolveLoadingState(loadingState, loadingMessage);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedIndex(0);
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [open]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectableItems.length]);

  React.useEffect(() => {
    onSelectedIndexChange?.(selectedIndex);
  }, [onSelectedIndexChange, selectedIndex]);

  React.useEffect(() => {
    if (!open || !listRef.current) {
      return;
    }

    const selected = listRef.current.querySelector<HTMLElement>(
      `[data-selectable-index="${selectedIndex}"]`,
    );
    selected?.scrollIntoView?.({ block: "nearest" });
  }, [open, selectedIndex, selectableItems.length]);

  const selectItem = (item: CommandPaletteItem) => {
    if (item.disabled) {
      return;
    }

    onSelect(item.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (selectableItems.length > 0) {
          setSelectedIndex((index) => Math.min(index + 1, selectableItems.length - 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (selectableItems.length > 0) {
          setSelectedIndex((index) => Math.max(index - 1, 0));
        }
        break;
      case "Enter":
        event.preventDefault();
        if (selectableItems[selectedIndex]) {
          onSelect(selectableItems[selectedIndex]!.id);
        }
        break;
      case "Escape":
        event.preventDefault();
        onOpenChange(false);
        break;
      default:
        break;
    }
  };

  if (!open) {
    return null;
  }

  const showLoading = !isReady;
  const showEmpty = isReady && commands.length === 0;
  const activeItem = selectableItems[selectedIndex];

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
        aria-label={title}
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
        data-testid="command-palette"
        data-diagnostics={diagnostics ? "enabled" : undefined}
      >
        <div className="border-b border-[var(--color-border)] px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-listbox"
            aria-activedescendant={
              activeItem ? `command-palette-option-${activeItem.id}` : undefined
            }
            aria-label="Filter commands"
            placeholder="Type a command name…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted-foreground)]"
          />
        </div>

        <ul
          id="command-palette-listbox"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="max-h-80 overflow-y-auto py-1"
        >
          {showLoading ? (
            <CommandPaletteLoadingPanel state={resolvedLoadingState} />
          ) : null}

          {showEmpty ? <CommandPaletteEmptyPanel state={resolvedEmptyState} /> : null}

          {!showLoading &&
            !showEmpty &&
            rows.map((row, rowIndex) => {
              if (row.type === "section") {
                const isFirstSection = rowIndex === 0;

                return (
                  <li
                    key={row.id}
                    role="presentation"
                    aria-hidden
                    className={cn(
                      "px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]",
                      !isFirstSection && "mt-1 border-t border-[var(--color-border)]",
                    )}
                    data-testid="command-palette-group"
                    data-group-label={row.label}
                  >
                    {row.label}
                  </li>
                );
              }

              const { item, selectableIndex } = row;
              const selected =
                selectableIndex >= 0 && selectableIndex === selectedIndex;

              return (
                <li
                  key={item.id}
                  id={`command-palette-option-${item.id}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={item.disabled ? true : undefined}
                  aria-label={
                    item.description ? `${item.label}. ${item.description}` : item.label
                  }
                  data-selectable-index={
                    selectableIndex >= 0 ? selectableIndex : undefined
                  }
                  data-testid="command-palette-option"
                  data-disabled={item.disabled ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm",
                    item.disabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer text-[var(--color-foreground)]",
                    selected &&
                      !item.disabled &&
                      "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
                  )}
                  onMouseEnter={() => {
                    if (selectableIndex >= 0) {
                      setSelectedIndex(selectableIndex);
                    }
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectItem(item);
                  }}
                >
                  <CommandPaletteIcon item={item} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.label}</div>
                    {item.description ? (
                      <div
                        className={cn(
                          "truncate text-xs",
                          selected && !item.disabled
                            ? "text-[color-mix(in_srgb,var(--color-accent-foreground)_80%,transparent)]"
                            : "text-[var(--color-muted-foreground)]",
                        )}
                      >
                        {item.description}
                      </div>
                    ) : null}
                  </div>
                  {item.shortcut ? (
                    <CommandPaletteShortcut shortcut={item.shortcut} />
                  ) : null}
                </li>
              );
            })}
        </ul>

        {executionFeedback ? (
          <div
            className="border-t border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted-foreground)]"
            role="status"
            data-testid="command-palette-execution-feedback"
          >
            {executionFeedback.ok ? "Executed" : "Failed"}: {executionFeedback.actionId}{" "}
            ({executionFeedback.code})
          </div>
        ) : null}
      </div>
    </div>
  );
}
