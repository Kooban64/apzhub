"use client";

import { signOut } from "@apzhub/auth";
import { ThemeToggle } from "@apzhub/ui";
import {
  Activity,
  AlertTriangle,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  Cog,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Package,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  PLATFORM_ADMIN_GROUP_LABELS,
  PLATFORM_ADMIN_NAV,
  platformAdminNavLabel,
  type PlatformAdminNavGroupId,
  type PlatformAdminNavItem,
} from "@/lib/platform-admin/nav";

const GROUP_ORDER: readonly PlatformAdminNavGroupId[] = [
  "root",
  "customers",
  "platform",
  "operations",
  "governance",
  "system",
];

const NAV_ICONS: Record<string, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  tenants: Building2,
  subscriptions: RefreshCw,
  marketplace: Store,
  billing: CreditCard,
  products: Package,
  provisioning: Boxes,
  providers: Server,
  configuration: Cog,
  operations: Activity,
  incidents: AlertTriangle,
  jobs: ClipboardList,
  identity: Users,
  security: Shield,
  compliance: ShieldCheck,
  audit: ClipboardList,
  help: HelpCircle,
  settings: Settings,
};

function isActive(pathname: string, item: PlatformAdminNavItem): boolean {
  if (item.href === "/platform-admin") {
    return pathname === "/platform-admin" || pathname === "/platform-admin/";
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function PlatformAdminShell({
  userName,
  userEmail,
  children,
}: {
  readonly userName?: string;
  readonly userEmail?: string;
  readonly children: ReactNode;
}) {
  const pathname = usePathname() ?? "/platform-admin";
  const router = useRouter();
  const searchId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [footerHealth, setFooterHealth] = useState<string>("—");
  const [envLabel, setEnvLabel] = useState("—");
  const [version, setVersion] = useState("—");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/platform-admin/overview?window=24h", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as {
          data?: {
            environment?: string;
            platformVersion?: string;
            platformStatus?: { overall?: { value?: string; availability?: string } };
          };
        };
        if (cancelled) return;
        setEnvLabel(body.data?.environment ?? "—");
        setVersion(body.data?.platformVersion ?? "—");
        const overall = body.data?.platformStatus?.overall;
        if (overall?.availability === "ok" && overall.value) {
          setFooterHealth(String(overall.value));
        } else {
          setFooterHealth("unavailable");
        }
      } catch {
        if (!cancelled) setFooterHealth("unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      items: PLATFORM_ADMIN_NAV.filter((item) => item.group === group),
    })).filter((g) => g.items.length > 0);
  }, []);

  const onSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    },
    [],
  );

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = userName || userEmail || "Administrator";
  const sectionLabel = platformAdminNavLabel(pathname);

  return (
    <div
      className="flex h-dvh min-h-0 flex-col bg-[var(--color-background)] text-[var(--color-foreground)]"
      data-testid="platform-admin-shell"
    >
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight">APZ</span>
          <span className="truncate text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
            Platform Admin
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="relative hidden sm:block">
            <label htmlFor={searchId} className="sr-only">
              Search tenants, users, invoices, provisioning
            </label>
            <div className="flex h-7 items-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2">
              <Search
                className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]"
                aria-hidden
              />
              <input
                id={searchId}
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={onSearchKeyDown}
                placeholder="Search tenants, users, invoices…"
                className="w-56 bg-transparent text-xs outline-none placeholder:text-[var(--color-muted-foreground)]"
                data-testid="platform-admin-search"
                aria-expanded={searchOpen}
                aria-controls={`${searchId}-results`}
              />
            </div>
            {searchOpen && searchQuery.trim().length > 0 ? (
              <div
                id={`${searchId}-results`}
                role="listbox"
                className="absolute top-full right-0 z-50 mt-1 w-80 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs shadow-md"
              >
                <p className="text-[var(--color-muted-foreground)]">
                  Global lookup is not configured yet. Tenant search arrives with the
                  Tenants screen.
                </p>
                <button
                  type="button"
                  className="mt-2 text-[var(--color-primary)] underline"
                  onClick={() => setSearchOpen(false)}
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-[var(--color-muted)]"
            aria-label="Notifications (not configured)"
            title="Notifications not configured"
          >
            <Bell className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          </button>
          <ThemeToggle />
          <div className="flex items-center gap-1.5 pl-1">
            <span className="hidden max-w-[120px] truncate text-xs sm:inline">
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
          aria-label="Platform Admin"
          className="flex w-[220px] shrink-0 flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)]"
          data-testid="platform-admin-sidebar"
        >
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
              APZ
            </p>
            <p className="text-[11px] font-medium">Platform Admin</p>
          </div>
          {grouped.map(({ group, items }) => (
            <div key={group} className="px-2 py-1.5">
              {group !== "root" && group !== "system" ? (
                <p className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
                  {PLATFORM_ADMIN_GROUP_LABELS[group]}
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
                  const Icon = NAV_ICONS[item.id] ?? CircleFallback;
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
                        data-testid={`platform-admin-nav-${item.id}`}
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
        data-testid="platform-admin-status-bar"
      >
        <span className="font-medium text-[var(--color-foreground)]">APZ Platform</span>
        <span className="inline-flex items-center gap-1 capitalize">
          <span aria-hidden>●</span>
          {footerHealth}
        </span>
        <span className="capitalize">{envLabel}</span>
        <span className="ml-auto font-mono">{version}</span>
      </footer>
    </div>
  );
}

function CircleFallback(props: { className?: string }) {
  return <LayoutDashboard {...props} />;
}
