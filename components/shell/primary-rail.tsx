"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutDashboard, Shield, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShellNavIconKey, ShellPrimaryNavItem } from "@/types/shell-config";

const ICONS: Record<ShellNavIconKey, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  shield: Shield,
};

export function PrimaryRail({
  items,
  pathname,
  collapsed,
  onCollapsedChange,
}: {
  items: ShellPrimaryNavItem[];
  pathname: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const toggle = () => {
    onCollapsedChange(!collapsed);
  };

  const widthClass = collapsed ? "w-[var(--shell-rail-collapsed)]" : "w-[var(--shell-rail-width)]";

  return (
    <aside
      suppressHydrationWarning
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out",
        widthClass,
      )}
      data-testid="primary-rail"
      data-collapsed={collapsed ? "true" : "false"}
    >
      <nav
        className="flex flex-1 flex-col gap-1 p-[var(--shell-pad)] pt-3"
        aria-label="Primary navigation"
      >
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = ICONS[item.iconKey];
          const muted = item.tone === "muted";
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : muted
                    ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
              title={item.label}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="w-full text-sidebar-foreground"
          onClick={toggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          data-testid="primary-rail-toggle"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  );
}
