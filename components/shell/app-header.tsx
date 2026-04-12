"use client";

import Link from "next/link";

import { useSession } from "@/components/providers/session-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dualWorkspaceAdminMode } from "@/lib/auth/mode-contract";
import { applyShellPatch } from "@/lib/shell/state-model";
import { APP_THEMES, type AppThemeId } from "@/lib/theme/constants";
import { useAppTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";
import type { ShellChromeConfig, ShellMode } from "@/types/shell-config";

const THEME_LABELS: Record<AppThemeId, string> = {
  "mist-blue": "Mist Blue",
  "sage-green": "Sage Green",
  "soft-charcoal": "Soft Charcoal",
  graphite: "Graphite",
  obsidian: "Obsidian",
};

function persistMode(mode: ShellMode) {
  applyShellPatch({ preferredShellMode: mode });
}

export function AppHeader({ chrome }: { chrome: ShellChromeConfig }) {
  const { theme, setTheme } = useAppTheme();
  const { snapshot, loading, signOut } = useSession();

  const activeSession = !loading && snapshot.sessionStatus === "active";
  const dualMode = activeSession && dualWorkspaceAdminMode(snapshot);

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-[var(--shell-gap)] border-b border-border bg-surface px-[var(--shell-pad)]"
      data-testid="app-header"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href={chrome.brandHomeHref}
          className="text-sm font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          APZHUB
        </Link>
        <span
          className="hidden text-sm text-muted-foreground sm:inline"
          data-testid="header-context"
        >
          {chrome.headerContextTitle}
        </span>
      </div>

      <div className="hidden max-w-md flex-1 px-4 md:block">
        <div
          className="flex h-9 w-full items-center rounded-md border border-border/80 bg-muted/30 px-3 text-sm text-muted-foreground"
          role="note"
          tabIndex={-1}
          aria-label="Global search is not enabled in this build. This control is not interactive."
          title="Global search is delivered in a later milestone."
        >
          Search (not yet enabled)
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {dualMode && chrome.mode === "workspace" ? (
          <Link
            href="/admin"
            onClick={() => persistMode("admin")}
            data-testid="mode-switch-admin"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Admin console
          </Link>
        ) : null}
        {dualMode && chrome.mode === "admin" ? (
          <Link
            href="/workspace"
            onClick={() => persistMode("workspace")}
            data-testid="mode-switch-workspace"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Workspace
          </Link>
        ) : null}

        {activeSession ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="header-sign-out"
            onClick={() => void signOut()}
          >
            Sign out
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            data-testid="theme-menu-trigger"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Theme: {THEME_LABELS[theme]}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as AppThemeId)}
              >
                {APP_THEMES.map((id) => (
                  <DropdownMenuRadioItem key={id} value={id}>
                    {THEME_LABELS[id]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <span id="header-alerts-hint" className="sr-only">
          Notifications are not wired in this build. This control is intentionally disabled until a
          later milestone.
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled
          aria-describedby="header-alerts-hint"
          title="Notifications ship in a later milestone."
        >
          Alerts
        </Button>
        <span id="header-apps-hint" className="sr-only">
          App launcher is not wired in this build. This control is intentionally disabled until a
          later milestone.
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled
          aria-describedby="header-apps-hint"
          title="App launcher ships in a later milestone."
        >
          Apps
        </Button>
        <div
          className={cn(
            "flex size-8 select-none items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/40 text-xs font-medium text-muted-foreground",
          )}
          role="img"
          tabIndex={-1}
          aria-label="Profile placeholder. Account and sign-in ship in Phase 2. This element is not interactive."
          title="Profile and account controls ship in Phase 2."
        >
          AP
        </div>
      </div>
    </header>
  );
}
