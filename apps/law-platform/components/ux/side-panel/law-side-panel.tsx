"use client";

import type { ReactNode } from "react";

export interface LawSidePanelProps {
  readonly title: string;
  readonly open?: boolean;
  readonly onClose?: () => void;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}

/** Reusable right-side panel shell — no business content (LAW-001-02). */
export function LawSidePanel({
  title,
  open = true,
  onClose,
  children,
  footer,
}: LawSidePanelProps) {
  if (!open) {
    return null;
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)]"
      data-testid="law-side-panel"
      aria-label={title}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          {title}
        </h2>
        {onClose ? (
          <button
            type="button"
            className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            onClick={onClose}
            aria-label="Close panel"
          >
            Close
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
      {footer ? (
        <div className="border-t border-[var(--color-border)] p-4">{footer}</div>
      ) : null}
    </aside>
  );
}
