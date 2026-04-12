"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

import type { ShellMode } from "@/types/shell-config";

const adminNavClass =
  "rounded-md px-2 py-1.5 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SecondaryRail({ mode }: { mode: ShellMode }) {
  const pathname = usePathname() ?? "/";

  if (mode === "admin") {
    const under = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
    const onOverview = pathname === "/admin" || pathname === "/admin/";

    return (
      <aside
        className="w-52 shrink-0 border-r border-border bg-surface p-[var(--shell-pad)]"
        data-testid="secondary-rail"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>
        <nav className="flex flex-col gap-1 text-sm" aria-label="Admin sections">
          <Link href="/admin" className={cn(adminNavClass, onOverview ? "bg-muted/50" : "hover:bg-muted/40")}>
            Overview
          </Link>
          <Link
            href="/admin/alerts"
            className={cn(adminNavClass, under("/admin/alerts") ? "bg-muted/50" : "hover:bg-muted/40")}
          >
            Alerts
          </Link>
          <Link href="/admin/audit" className={cn(adminNavClass, under("/admin/audit") ? "bg-muted/50" : "hover:bg-muted/40")}>
            Audit
          </Link>
          <Link href="/admin/users" className={cn(adminNavClass, under("/admin/users") ? "bg-muted/50" : "hover:bg-muted/40")}>
            Users
          </Link>
          <Link href="/admin/access" className={cn(adminNavClass, under("/admin/access") ? "bg-muted/50" : "hover:bg-muted/40")}>
            Access matrix
          </Link>
          <Link
            href="/admin/provisioning"
            className={cn(adminNavClass, under("/admin/provisioning") ? "bg-muted/50" : "hover:bg-muted/40")}
          >
            Provisioning
          </Link>
          <Link href="/admin/bundles" className={cn(adminNavClass, under("/admin/bundles") ? "bg-muted/50" : "hover:bg-muted/40")}>
            Bundles
          </Link>
          <Link
            href="/admin/services"
            className={cn(adminNavClass, under("/admin/services") ? "bg-muted/50" : "hover:bg-muted/40")}
          >
            Services
          </Link>
        </nav>
      </aside>
    );
  }

  return (
    <aside
      className="w-52 shrink-0 border-r border-border bg-surface p-[var(--shell-pad)]"
      data-testid="secondary-rail"
    >
      <EmptyState
        title="Local navigation"
        description="When you open a primary area like My Work, filters and sub-pages appear here."
      />
    </aside>
  );
}
