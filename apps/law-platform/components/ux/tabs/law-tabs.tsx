"use client";

import { cn } from "@apzhub/ui";

export interface LawTabItem {
  readonly id: string;
  readonly label: string;
}

export interface LawTabsProps {
  readonly items: readonly LawTabItem[];
  readonly activeId: string;
  readonly onChange: (id: string) => void;
}

/** Presentational tab list for detail pages (LAW-001-02). */
export function LawTabs({ items, activeId, onChange }: LawTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2 border-b border-[var(--color-border)]"
      data-testid="law-tabs"
      role="tablist"
    >
      {items.map((item) => {
        const active = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-[var(--law-accent)] text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
            )}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
