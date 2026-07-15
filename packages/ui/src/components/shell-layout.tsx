"use client";

import type { ReactNode } from "react";

import { Header } from "./header";
import { Sidebar, type SidebarItem } from "./sidebar";
import { StatusBar } from "./status-bar";

export interface ActivityBarItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  ariaLabel: string;
}

export interface ActivityBarProps {
  items: ActivityBarItem[];
  onItemSelect?: (id: string) => void;
}

export interface ShellLayoutProps {
  userName?: string;
  sidebarItems: SidebarItem[];
  onSidebarSelect?: (id: string) => void;
  activityBarItems: ActivityBarItem[];
  onActivityBarSelect?: (id: string) => void;
  environment?: string;
  onSignOut?: () => void;
  headerTrailing?: React.ReactNode;
  children: ReactNode;
}

function resolveActivityBarGlyph(item: ActivityBarItem): string {
  if (item.icon && item.icon.length === 1) {
    return item.icon;
  }

  return item.label.charAt(0).toUpperCase();
}

export function ActivityBar({ items, onItemSelect }: ActivityBarProps) {
  return (
    <nav
      className="flex w-12 shrink-0 flex-col items-center gap-2 border-r border-[var(--color-border)] bg-[var(--color-muted)] py-3"
      aria-label="Activity bar"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onItemSelect?.(item.id)}
          className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
            item.active
              ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
              : "text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
          }`}
          aria-label={item.ariaLabel}
          aria-current={item.active ? "page" : undefined}
        >
          {resolveActivityBarGlyph(item)}
        </button>
      ))}
    </nav>
  );
}

export function ShellLayout({
  userName,
  sidebarItems,
  onSidebarSelect,
  activityBarItems,
  onActivityBarSelect,
  environment,
  onSignOut,
  headerTrailing,
  children,
}: ShellLayoutProps) {
  return (
    <div className="flex h-full min-h-0 max-w-full flex-col overflow-x-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <Header
        userName={userName}
        onSignOut={onSignOut}
        headerTrailing={headerTrailing}
      />
      <div className="flex min-h-0 min-w-0 flex-1 overflow-x-hidden">
        <ActivityBar items={activityBarItems} onItemSelect={onActivityBarSelect} />
        <Sidebar items={sidebarItems} onSelect={onSidebarSelect} />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
      <StatusBar environment={environment} />
    </div>
  );
}
