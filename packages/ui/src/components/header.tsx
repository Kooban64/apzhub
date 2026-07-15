"use client";

import type { ReactNode } from "react";
import { useTheme } from "@apzhub/theme";
import { useEffect, useState } from "react";

import { Button } from "./button";

export interface HeaderProps {
  userName?: string;
  onSignOut?: () => void;
  /** Optional trailing shell actions (e.g. notification badge). */
  headerTrailing?: ReactNode;
}

export function Header({ userName, onSignOut, headerTrailing }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeLabel =
    !mounted || theme === undefined ? "Theme" : theme === "dark" ? "Light" : "Dark";

  return (
    <header className="flex h-12 min-w-0 shrink-0 items-center justify-between gap-2 overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-sm font-semibold tracking-wide">APZHUB</span>
        <span className="hidden text-xs text-[var(--color-muted-foreground)] sm:inline">
          Home
        </span>
      </div>
      <div className="flex min-w-0 shrink items-center gap-2">
        {headerTrailing}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          suppressHydrationWarning
        >
          {themeLabel}
        </Button>
        {userName ? (
          <span className="hidden max-w-[9rem] truncate text-sm text-[var(--color-muted-foreground)] sm:inline">
            {userName}
          </span>
        ) : null}
        {onSignOut ? (
          <Button type="button" variant="ghost" size="sm" onClick={onSignOut}>
            Sign out
          </Button>
        ) : null}
      </div>
    </header>
  );
}
