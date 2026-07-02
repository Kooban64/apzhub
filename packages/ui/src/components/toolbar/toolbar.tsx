"use client";

import { cn } from "../../lib/utils";
import type { ToolbarEmptyState, ToolbarItem } from "./types";

export interface ToolbarProps {
  readonly items: readonly ToolbarItem[];
  readonly onSelect: (actionId: string) => void;
  readonly ariaLabel?: string;
  readonly emptyState?: ToolbarEmptyState;
}

function resolveGlyph(item: ToolbarItem): string {
  if (item.icon && item.icon.length === 1) {
    return item.icon;
  }

  return item.label.charAt(0).toUpperCase();
}

export function Toolbar({
  items,
  onSelect,
  ariaLabel = "Toolbar",
  emptyState = { title: "No toolbar actions" },
}: ToolbarProps) {
  if (items.length === 0) {
    return (
      <div
        role="toolbar"
        aria-label={ariaLabel}
        data-testid="toolbar-empty"
        className="mb-4 flex min-h-10 items-center rounded-lg border border-dashed border-[var(--color-border)] px-3"
      >
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {emptyState.title}
        </p>
        {emptyState.description ? (
          <p className="ml-2 text-xs text-[var(--color-muted-foreground)]">
            {emptyState.description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      data-testid="toolbar"
      className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          title={item.label}
          aria-label={
            item.description ? `${item.label}. ${item.description}` : item.label
          }
          aria-disabled={item.disabled ? true : undefined}
          data-testid="toolbar-item"
          data-action-id={item.id}
          data-disabled={item.disabled ? "true" : undefined}
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors",
            item.disabled
              ? "cursor-not-allowed opacity-50"
              : "text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
          )}
          onClick={() => {
            if (item.disabled) {
              return;
            }

            onSelect(item.id);
          }}
        >
          <span aria-hidden className="px-1">
            {resolveGlyph(item)}
          </span>
          <span className="sr-only">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
