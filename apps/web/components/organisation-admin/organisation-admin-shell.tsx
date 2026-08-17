"use client";

import { signOut } from "@apzhub/auth";
import { ThemeToggle } from "@apzhub/ui";
import {
  Boxes,
  ClipboardList,
  Cog,
  HelpCircle,
  LayoutDashboard,
  Package,
  Plug,
  Settings,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  filterOrganisationAdminNav,
  ORGANISATION_ADMIN_BASE,
  ORGANISATION_ADMIN_GROUP_LABELS,
  organisationAdminNavLabel,
  type OrganisationAdminNavGroupId,
  type OrganisationAdminNavItem,
} from "@/lib/organisation-admin/nav";

const GROUP_ORDER: readonly OrganisationAdminNavGroupId[] = [
  "root",
  "organisation",
  "products",
  "workspace",
  "governance",
  "system",
];

const NAV_ICONS: Record<string, typeof LayoutDashboard> = {
  home: LayoutDashboard,
  people: Users,
  teams: UsersRound,
  roles: Shield,
  products: Package,
  provisioning: Boxes,
  "workspace-settings": Cog,
  integrations: Plug,
  security: Shield,
  audit: ClipboardList,
  help: HelpCircle,
  settings: Settings,
};

function isActive(pathname: string, item: OrganisationAdminNavItem): boolean {
  if (item.href === ORGANISATION_ADMIN_BASE) {
    return (
      pathname === ORGANISATION_ADMIN_BASE || pathname === `${ORGANISATION_ADMIN_BASE}/`
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function OrganisationAdminShell({
  tenantName,
  userName,
  userEmail,
  permissions,
  children,
}: {
  readonly tenantName?: string;
  readonly userName?: string;
  readonly userEmail?: string;
  readonly permissions: readonly string[];
  readonly children: ReactNode;
}) {
  const pathname = usePathname() ?? ORGANISATION_ADMIN_BASE;
  const router = useRouter();
  const [orgLabel, setOrgLabel] = useState(tenantName ?? "Organisation");

  useEffect(() => {
    if (tenantName) {
      setOrgLabel(tenantName);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/organisation-admin/home", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as {
          data?: { tenant?: { name?: string } };
        };
        if (!cancelled && body.data?.tenant?.name) {
          setOrgLabel(body.data.tenant.name);
        }
      } catch {
        // keep default
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantName]);

  const nav = filterOrganisationAdminNav(permissions);
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: nav.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0);

  const displayName = userName || userEmail || "Administrator";
  const sectionLabel = organisationAdminNavLabel(pathname);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className="flex h-dvh min-h-0 flex-col bg-[var(--color-background)] text-[var(--color-foreground)]"
      data-testid="organisation-admin-shell"
    >
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight">APZ</span>
          <span
            className="truncate text-xs font-medium"
            data-testid="organisation-admin-header-org"
          >
            {orgLabel}
          </span>
          <span className="hidden truncate text-[11px] text-[var(--color-muted-foreground)] sm:inline">
            · Organisation Administration
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span
            className="hidden text-[11px] text-[var(--color-muted-foreground)] md:inline"
            title="Search is not configured on Organisation Admin yet"
          >
            Search
          </span>
          <ThemeToggle />
          <div className="flex items-center gap-1.5">
            <span className="hidden max-w-[140px] truncate text-xs sm:inline">
              {displayName}
            </span>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="text-[11px] text-[var(--color-muted-foreground)] underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav
          aria-label="Organisation Admin"
          className="flex w-[200px] shrink-0 flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)]"
          data-testid="organisation-admin-sidebar"
        >
          <div className="border-b border-[var(--color-border)] px-3 py-3">
            <p className="text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
              APZ
            </p>
            <p
              className="mt-0.5 text-xs font-medium"
              data-testid="organisation-admin-org-name"
            >
              {orgLabel}
            </p>
          </div>
          {grouped.map(({ group, items }) => (
            <div key={group} className="px-2 py-1.5">
              {group !== "root" && group !== "system" ? (
                <p className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
                  {ORGANISATION_ADMIN_GROUP_LABELS[group]}
                </p>
              ) : null}
              {group === "system" ? (
                <div
                  className="mx-2 my-2 border-t border-[var(--color-border)]"
                  aria-hidden
                />
              ) : null}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = NAV_ICONS[item.id] ?? LayoutDashboard;
                  const active = isActive(pathname, item);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs ${
                          active
                            ? "bg-[var(--color-muted)] font-medium"
                            : "hover:bg-[var(--color-muted)]/60"
                        } ${item.implemented ? "" : "text-[var(--color-muted-foreground)]"}`}
                        data-testid={`organisation-admin-nav-${item.id}`}
                        data-implemented={item.implemented ? "true" : "false"}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="sr-only" aria-live="polite">
            {sectionLabel}
          </div>
          {children}
        </main>
      </div>

      <footer
        className="flex h-8 shrink-0 items-center gap-3 border-t border-[var(--color-border)] px-3 text-[10px] text-[var(--color-muted-foreground)]"
        data-testid="organisation-admin-status-bar"
      >
        <span className="font-medium text-[var(--color-foreground)]">{orgLabel}</span>
        <span className="ml-auto">Tenant-scoped · Organisation Administration</span>
      </footer>
    </div>
  );
}
