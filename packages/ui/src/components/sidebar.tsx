"use client";

import { resolveLucideIcon } from "../icons/resolve-lucide-icon";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  /** Visual divider or compact section heading — not selectable. */
  kind?: "item" | "separator" | "section";
}

export interface SidebarProps {
  items: SidebarItem[];
  onSelect?: (id: string) => void;
}

export function Sidebar({ items, onSelect }: SidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="flex flex-col gap-1 p-2" aria-label="Workspace navigation">
        {items.map((item) => {
          if (item.kind === "separator") {
            return (
              <div
                key={item.id}
                className="my-1 border-t border-[var(--color-border)]"
              />
            );
          }
          if (item.kind === "section") {
            return (
              <p
                key={item.id}
                className="px-3 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]"
              >
                {item.label}
              </p>
            );
          }
          const Icon = resolveLucideIcon(item.icon);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                item.active
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                  : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
              }`}
            >
              {Icon ? (
                <Icon
                  className="h-4 w-4 shrink-0 opacity-80"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
              ) : null}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
