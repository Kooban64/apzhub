"use client";

export interface SidebarItem {
  id: string;
  label: string;
  active?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  onSelect?: (id: string) => void;
}

export function Sidebar({ items, onSelect }: SidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="flex flex-col gap-1 p-2" aria-label="Workspace navigation">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
              item.active
                ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
