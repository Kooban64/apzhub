"use client";

import { ThemeToggle } from "@apzhub/ui";
import { CircleHelp, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Compact User Workbench header (~44–48px) — not Admin / marketing chrome.
 */
export function WorkbenchHeader({
  organisation,
  userName,
  onSignOut,
  onOpenSearch,
  notifications,
  accountMenu,
}: {
  readonly organisation?: ReactNode;
  readonly userName?: string;
  readonly onSignOut?: () => void;
  readonly onOpenSearch?: () => void;
  readonly notifications?: ReactNode;
  readonly accountMenu?: ReactNode;
}) {
  return (
    <header
      className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3"
      data-testid="workbench-header"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-sm font-semibold tracking-tight">APZ</span>
        <span className="text-[var(--color-border)]" aria-hidden>
          │
        </span>
        {organisation}
      </div>

      <div className="mx-auto flex min-w-0 max-w-xl flex-1 justify-center px-2">
        <button
          type="button"
          onClick={() => onOpenSearch?.()}
          className="flex w-full max-w-md items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2.5 py-1.5 text-left text-xs text-[var(--color-muted-foreground)] hover:border-[var(--color-foreground)]/30"
          data-testid="global-search-trigger"
          aria-label="Open global search"
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="flex-1 truncate">Search APZ...</span>
          <kbd className="hidden shrink-0 text-[10px] sm:inline">Ctrl+K</kbd>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {notifications}
        <Link
          href="/workspace/personalisation"
          className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          aria-label="Help"
          title="Help"
          data-testid="workbench-help"
        >
          <CircleHelp className="h-4 w-4" aria-hidden />
        </Link>
        <ThemeToggle />
        {accountMenu ?? (
          <div className="flex items-center gap-1.5 pl-1">
            {userName ? (
              <span
                className="hidden max-w-[7rem] truncate text-xs sm:inline"
                data-testid="workbench-user-name"
              >
                {userName}
              </span>
            ) : null}
            {onSignOut ? (
              <button
                type="button"
                onClick={onSignOut}
                className="text-[11px] text-[var(--color-muted-foreground)] underline-offset-2 hover:underline"
              >
                Sign out
              </button>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
