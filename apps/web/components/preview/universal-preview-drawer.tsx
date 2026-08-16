"use client";

import { Button } from "@apzhub/ui";
import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Stream 4 universal preview drawer — slide-over chrome for cross-product previews.
 * R4-09: Escape, initial focus, Tab focus trap, restore focus on close.
 */
export function UniversalPreviewDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  testId = "universal-preview-drawer",
}: {
  readonly open: boolean;
  readonly title: string;
  readonly subtitle?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly testId?: string;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/30"
      data-testid={`${testId}-overlay`}
      role="presentation"
      onClick={onClose}
    >
      <aside
        ref={panelRef}
        className="flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid={testId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.14em] text-[var(--color-muted-foreground)] uppercase">
              Preview
            </p>
            <h2 id={titleId} className="mt-1 truncate text-lg font-semibold">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                {subtitle}
              </p>
            ) : null}
          </div>
          <Button
            ref={closeRef}
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClose}
            data-testid={`${testId}-close`}
          >
            Close
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <footer className="border-t border-[var(--color-border)] px-4 py-3">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
