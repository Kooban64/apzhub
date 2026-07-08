import type { ReactNode } from "react";

export interface LawFilterBarProps {
  readonly children?: ReactNode;
  readonly label?: string;
}

/** Presentational filter container — no filtering logic (LAW-001-02). */
export function LawFilterBar({ children, label = "Filters" }: LawFilterBarProps) {
  return (
    <section
      className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-3"
      data-testid="law-filter-bar"
      aria-label={label}
    >
      {children ?? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Filter controls will be composed here by future modules.
        </p>
      )}
    </section>
  );
}
