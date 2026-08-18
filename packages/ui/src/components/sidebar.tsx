"use client";

import { resolveLucideIcon } from "../icons/resolve-lucide-icon";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  /** Visual divider — not selectable. */
  kind?: "item" | "separator";
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
