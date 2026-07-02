"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import type { ContextMenuEmptyState, ContextMenuItem } from "./types";

export interface ContextMenuProps {
  readonly open: boolean;
  readonly x: number;
  readonly y: number;
  readonly items: readonly ContextMenuItem[];
  readonly onSelect: (actionId: string) => void;
  readonly onClose: () => void;
  readonly emptyState?: ContextMenuEmptyState;
  readonly title?: string;
}

function resolveGlyph(item: ContextMenuItem): string {
  if (item.icon && item.icon.length === 1) {
    return item.icon;
  }

  return item.label.charAt(0).toUpperCase();
}

function ContextMenuIcon({ item }: { readonly item: ContextMenuItem }) {
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-muted)] text-xs font-semibold text-[var(--color-muted-foreground)]"
    >
      {resolveGlyph(item)}
    </span>
  );
}

export function ContextMenu({
  open,
  x,
  y,
  items,
  onSelect,
  onClose,
  emptyState = { title: "No actions available" },
  title = "Context Menu",
}: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const showEmpty = items.length === 0;

  return (
    <div
      className="fixed inset-0 z-50"
      data-testid="context-menu-layer"
      onContextMenu={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        ref={menuRef}
        role="menu"
        aria-label={title}
        data-testid="context-menu"
        className="absolute min-w-56 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
        style={{ top: y, left: x }}
      >
        {showEmpty ? (
          <div
            className="px-3 py-4 text-center"
            role="status"
            data-testid="context-menu-empty"
          >
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              {emptyState.title}
            </p>
            {emptyState.description ? (
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                {emptyState.description}
              </p>
            ) : null}
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              aria-disabled={item.disabled ? true : undefined}
              aria-label={
                item.description ? `${item.label}. ${item.description}` : item.label
              }
              data-testid="context-menu-item"
              data-disabled={item.disabled ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left text-sm",
                item.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
              )}
              onClick={() => {
                if (item.disabled) {
                  return;
                }

                onSelect(item.id);
              }}
            >
              <ContextMenuIcon item={item} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.label}</span>
                {item.description ? (
                  <span className="block truncate text-xs text-[var(--color-muted-foreground)]">
                    {item.description}
                  </span>
                ) : null}
              </span>
              {item.shortcut ? (
                <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted-foreground)]">
                  {item.shortcut}
                </kbd>
              ) : null}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
