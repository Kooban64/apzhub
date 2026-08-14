"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlarmClock,
  AlertTriangle,
  BadgeCheck,
  BadgeDollarSign,
  Bell,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  Circle,
  ClipboardList,
  Cog,
  CreditCard,
  FileText,
  Gauge,
  GitBranch,
  HeartPulse,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Layers,
  Lock,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Repeat,
  RotateCcw,
  Scale,
  ScrollText,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

import { ThemeToggle } from "@apzhub/ui";
import { signOut } from "@apzhub/auth";

import type { DemoPersonaKind } from "@/lib/demo/demo-personas";
import {
  activeNavLabel,
  modesForKind,
  navForShell,
  type OperatorMode,
  type OperatorNavItem,
  type OperatorShellId,
} from "@/lib/operator/shell-landing";
import { TenantSwitcher } from "@/components/operator/tenant-switcher";

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 320;
const SIDEBAR_DEFAULT = 220;
const SIDEBAR_COLLAPSED = 48;
const STORAGE_KEY = "apzhub.operator.sidebarWidth";
const COLLAPSED_KEY = "apzhub.operator.sidebarCollapsed";

type PlatformHealth = {
  platform?: string;
  database?: string;
  redis?: string;
  auth?: string;
};

type HomeContext = {
  kind: DemoPersonaKind;
  tenantId: string | null;
  name?: string | null;
  email?: string | null;
};

function loadWidth(): number {
  if (typeof window === "undefined") return SIDEBAR_DEFAULT;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number(raw) : SIDEBAR_DEFAULT;
  if (!Number.isFinite(n)) return SIDEBAR_DEFAULT;
  return Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, n));
}

function loadCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(COLLAPSED_KEY) === "1";
}

const NAV_ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  customers: Building2,
  catalogue: Package,
  limits: Gauge,
  payments: CreditCard,
  "api-keys": KeyRound,
  secrets: Lock,
  audit: ScrollText,
  health: HeartPulse,
  monitoring: Activity,
  performance: Zap,
  sessions: Users,
  workers: Cog,
  diagnostics: Stethoscope,
  tuning: SlidersHorizontal,
  accounts: Wallet,
  invoices: FileText,
  dunning: AlarmClock,
  credits: BadgeDollarSign,
  refunds: RotateCcw,
  statements: BookOpen,
  signups: UserPlus,
  statutory: Scale,
  entitlements: ShieldCheck,
  findings: AlertTriangle,
  remediation: Wrench,
  retests: RotateCcw,
  evidence: ClipboardList,
  certification: BadgeCheck,
  members: UsersRound,
  services: Layers,
  subscriptions: Repeat,
  sources: GitBranch,
  billing: Receipt,
  engagements: Shield,
  assets: Layers,
  code: GitBranch,
  intelligence: Zap,
  providers: Server,
  reports: FileText,
};

const MODE_ICONS: Record<OperatorMode["id"], LucideIcon> = {
  console: Shield,
  ops: Server,
  finance: Landmark,
  compliance: Scale,
  org: Building2,
  apzpen: ShieldCheck,
};

function healthTone(value: string | undefined): "ok" | "warn" | "bad" | "unknown" {
  if (!value || value === "unknown") return "unknown";
  if (value === "ok" || value === "running" || value === "healthy") return "ok";
  if (value === "degraded" || value === "idle") return "warn";
  return "bad";
}

function toneClass(tone: "ok" | "warn" | "bad" | "unknown"): string {
  switch (tone) {
    case "ok":
      return "text-[var(--color-success)]";
    case "warn":
      return "text-[var(--color-warning)]";
    case "bad":
      return "text-[var(--color-destructive)]";
    default:
      return "text-[var(--color-muted-foreground)]";
  }
}

export function OperatorShell({
  shell,
  title,
  userName,
  userEmail,
  children,
}: {
  readonly shell: OperatorShellId;
  readonly title: string;
  readonly userName?: string;
  readonly userEmail?: string;
  readonly children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = navForShell(shell);
  const [width, setWidth] = useState(SIDEBAR_DEFAULT);
  const [collapsed, setCollapsed] = useState(false);
  const [home, setHome] = useState<HomeContext | null>(null);
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [envLabel, setEnvLabel] = useState("development");
  const [clock, setClock] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [modesOpen, setModesOpen] = useState(false);
  const dragging = useRef(false);
  const headerMenusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setWidth(loadWidth());
    setCollapsed(loadCollapsed());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context");
        const body = (await res.json()) as {
          data?: {
            kind?: DemoPersonaKind;
            tenantId?: string | null;
            name?: string | null;
            email?: string | null;
          };
        };
        if (cancelled || !body.data?.kind) return;
        setHome({
          kind: body.data.kind,
          tenantId: body.data.tenantId ?? null,
          name: body.data.name,
          email: body.data.email,
        });
      } catch {
        /* soft-fail — modes default below */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/v1/ops/platform");
        if (!res.ok) throw new Error("ops unavailable");
        const body = (await res.json()) as {
          data?: {
            health?: PlatformHealth;
            sessions?: { environment?: string };
          };
        };
        if (cancelled) return;
        setHealth(body.data?.health ?? null);
        if (body.data?.sessions?.environment) {
          setEnvLabel(body.data.sessions.environment);
        }
      } catch {
        try {
          const res = await fetch("/api/health");
          const body = (await res.json()) as { status?: string };
          if (cancelled) return;
          setHealth({
            platform: body.status === "ok" ? "ok" : "degraded",
            database: "unknown",
            auth: "unknown",
            redis: "unknown",
          });
        } catch {
          if (!cancelled) {
            setHealth({
              platform: "unknown",
              database: "unknown",
              auth: "unknown",
              redis: "unknown",
            });
          }
        }
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!headerMenusRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
        setSettingsOpen(false);
        setNotifyOpen(false);
        setModesOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onPointerMove = useCallback((event: PointerEvent) => {
    if (!dragging.current) return;
    const next = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, event.clientX));
    setWidth(next);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    setWidth((w) => {
      window.localStorage.setItem(STORAGE_KEY, String(w));
      return w;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }

  function closeMenus() {
    setAccountOpen(false);
    setSettingsOpen(false);
    setNotifyOpen(false);
    setModesOpen(false);
  }

  const modes = useMemo(() => {
    if (home?.kind) return modesForKind(home.kind);
    return modesForKind("superadmin").filter((m) => m.id === shell);
  }, [home?.kind, shell]);

  const sectionLabel = activeNavLabel(shell, pathname);
  const displayName = home?.name || userName || "Operator";
  const displayEmail = home?.email || userEmail || "";
  const sidebarW = collapsed ? SIDEBAR_COLLAPSED : width;
  const platformTone = healthTone(health?.platform);
  const dbTone = healthTone(health?.database);
  const authTone = healthTone(health?.auth);

  return (
    <div className="flex h-dvh min-h-screen flex-col overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header
        ref={headerMenusRef}
        className="relative z-40 flex h-10 shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2"
      >
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          )}
        </button>

        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold tracking-tight">
            APZHUB
          </span>
          <span className="text-[var(--color-muted-foreground)]" aria-hidden>
            /
          </span>
          <ModeSwitcher
            modes={modes}
            activeShell={shell}
            open={modesOpen}
            onOpenChange={(open) => {
              closeMenus();
              setModesOpen(open);
            }}
          />
        </div>

        <div className="mx-2 hidden min-w-0 flex-1 items-center gap-1.5 md:flex">
          <span className="truncate text-[11px] text-[var(--color-muted-foreground)]">
            {title}
          </span>
          <span className="text-[var(--color-muted-foreground)]" aria-hidden>
            ·
          </span>
          <span className="truncate text-[11px] font-medium">{sectionLabel}</span>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <TenantSwitcher className="mr-1 hidden sm:inline-flex" />
          <StatusPulse
            tone={platformTone}
            label="Platform"
            detail={health?.platform ?? "…"}
          />

          <HeaderIconButton
            label="Notifications"
            active={notifyOpen}
            onClick={() => {
              const next = !notifyOpen;
              closeMenus();
              setNotifyOpen(next);
            }}
          >
            <Bell className="h-3.5 w-3.5" aria-hidden />
          </HeaderIconButton>

          <ThemeToggle className="h-7 w-7 rounded border-0 bg-transparent hover:bg-[var(--color-muted)]" />

          <HeaderIconButton
            label="Settings"
            active={settingsOpen}
            onClick={() => {
              const next = !settingsOpen;
              closeMenus();
              setSettingsOpen(next);
            }}
          >
            <Settings className="h-3.5 w-3.5" aria-hidden />
          </HeaderIconButton>

          <HeaderIconButton
            label="Account"
            active={accountOpen}
            onClick={() => {
              const next = !accountOpen;
              closeMenus();
              setAccountOpen(next);
            }}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-muted)] text-[10px] font-semibold">
              {(displayName || "O").charAt(0).toUpperCase()}
            </span>
          </HeaderIconButton>
        </div>

        {notifyOpen ? (
          <PopoverPanel align="right" title="Notifications">
            <p className="px-3 py-4 text-[11px] text-[var(--color-muted-foreground)]">
              No operator alerts yet. Attention stream comes later.
            </p>
          </PopoverPanel>
        ) : null}

        {settingsOpen ? (
          <PopoverPanel align="right" title="Shell settings">
            <ul className="py-1 text-[12px]">
              <li className="px-3 py-2 text-[var(--color-muted-foreground)]">
                Density · Compact
              </li>
              <li className="px-3 py-2 text-[var(--color-muted-foreground)]">
                Sidebar · {collapsed ? "Collapsed" : "Expanded"}
              </li>
              <li>
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-left hover:bg-[var(--color-muted)]"
                  onClick={toggleCollapsed}
                >
                  {collapsed ? "Expand left rail" : "Collapse left rail"}
                </button>
              </li>
            </ul>
          </PopoverPanel>
        ) : null}

        {accountOpen ? (
          <PopoverPanel align="right" title="Account">
            <div className="border-b border-[var(--color-border)] px-3 py-2">
              <p className="truncate text-[12px] font-medium">{displayName}</p>
              {displayEmail ? (
                <p className="truncate text-[11px] text-[var(--color-muted-foreground)]">
                  {displayEmail}
                </p>
              ) : null}
              {home?.kind ? (
                <p className="mt-1 text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
                  {home.kind.replaceAll("_", " ")}
                </p>
              ) : null}
            </div>
            <div className="border-b border-[var(--color-border)] px-2 py-2 sm:hidden">
              <TenantSwitcher />
            </div>
            <button
              type="button"
              className="flex w-full px-3 py-2 text-left text-[12px] hover:bg-[var(--color-muted)]"
              onClick={() => void handleSignOut()}
            >
              Sign out
            </button>
          </PopoverPanel>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className="relative flex shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]"
          style={{ width: sidebarW }}
          aria-label={`${title} navigation`}
        >
          <nav className="flex-1 overflow-y-auto py-1.5">
            {nav.map((item) => (
              <NavRow
                key={item.id}
                item={item}
                active={isNavActive(pathname, item.href, shell)}
                collapsed={collapsed}
              />
            ))}
          </nav>
          {!collapsed ? (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize sidebar"
              className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-[var(--color-primary)]/35"
              onPointerDown={(e) => {
                e.preventDefault();
                dragging.current = true;
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
              }}
            />
          ) : null}
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-[var(--color-background)]">
          {children}
        </main>
      </div>

      <footer className="flex h-6 shrink-0 items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-[10px] text-[var(--color-muted-foreground)]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-[var(--color-foreground)]">
            {title}
          </span>
          <span aria-hidden>·</span>
          <span className="truncate uppercase">{envLabel}</span>
          {home?.tenantId ? (
            <>
              <span aria-hidden>·</span>
              <span className="max-w-[120px] truncate font-mono" title={home.tenantId}>
                {home.tenantId}
              </span>
            </>
          ) : null}
        </div>

        <div className="mx-auto hidden items-center gap-3 sm:flex">
          <FooterChip label="Platform" tone={platformTone} />
          <FooterChip label="DB" tone={dbTone} />
          <FooterChip label="Auth" tone={authTone} />
        </div>

        <div className="ml-auto flex items-center gap-2 tabular-nums">
          <span className={toneClass(platformTone)}>Ready</span>
          <span aria-hidden>·</span>
          <span className="font-mono">{clock || "—"}</span>
        </div>
      </footer>
    </div>
  );
}

function ModeSwitcher({
  modes,
  activeShell,
  open,
  onOpenChange,
}: {
  readonly modes: readonly OperatorMode[];
  readonly activeShell: OperatorShellId;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  if (modes.length === 0) return null;

  const active = modes.find((m) => m.id === activeShell) ?? modes[0]!;
  const ActiveIcon = MODE_ICONS[active.id];

  if (modes.length === 1) {
    return (
      <span className="inline-flex items-center gap-1 truncate text-[12px] text-[var(--color-muted-foreground)]">
        <ActiveIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {active.shortLabel}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex h-7 items-center gap-1 rounded px-1.5 text-[12px] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => onOpenChange(!open)}
      >
        <ActiveIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{active.shortLabel}</span>
        <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute top-full left-0 z-50 mt-1 min-w-[200px] overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md"
        >
          {modes.map((mode) => {
            const Icon = MODE_ICONS[mode.id];
            const selected = mode.id === activeShell;
            return (
              <Link
                key={mode.id}
                href={mode.href}
                role="option"
                aria-selected={selected}
                className={`flex items-center gap-2 px-2.5 py-2 text-[12px] ${
                  selected
                    ? "bg-[var(--color-muted)] text-[var(--color-foreground)]"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/70 hover:text-[var(--color-foreground)]"
                }`}
                onClick={() => onOpenChange(false)}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="flex-1 truncate">{mode.label}</span>
                {selected ? (
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function StatusPulse({
  tone,
  label,
  detail,
}: {
  readonly tone: "ok" | "warn" | "bad" | "unknown";
  readonly label: string;
  readonly detail: string;
}) {
  return (
    <span
      className="mr-1 inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[10px] text-[var(--color-muted-foreground)]"
      title={`${label}: ${detail}`}
    >
      <Circle
        className={`h-2 w-2 fill-current ${toneClass(tone)} ${
          tone === "ok" ? "animate-pulse" : ""
        }`}
        aria-hidden
      />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function HeaderIconButton({
  label,
  active,
  onClick,
  children,
}: {
  readonly label: string;
  readonly active?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] ${
        active ? "bg-[var(--color-muted)] text-[var(--color-foreground)]" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PopoverPanel({
  align,
  title,
  children,
}: {
  readonly align: "right" | "left";
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <div
      className={`absolute top-full z-50 mt-1 w-64 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md ${
        align === "right" ? "right-2" : "left-2"
      }`}
      role="dialog"
      aria-label={title}
    >
      <div className="border-b border-[var(--color-border)] px-3 py-1.5 text-[10px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
        {title}
      </div>
      {children}
    </div>
  );
}

function FooterChip({
  label,
  tone,
}: {
  readonly label: string;
  readonly tone: "ok" | "warn" | "bad" | "unknown";
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Circle className={`h-1.5 w-1.5 fill-current ${toneClass(tone)}`} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

function isNavActive(pathname: string, href: string, shell: OperatorShellId): boolean {
  if (pathname === href) return true;
  const root = `/${shell}`;
  if (href === root) return pathname === root;
  return pathname.startsWith(`${href}/`) || pathname === href;
}

function NavRow({
  item,
  active,
  collapsed,
}: {
  readonly item: OperatorNavItem;
  readonly active: boolean;
  readonly collapsed: boolean;
}) {
  const Icon = NAV_ICONS[item.id] ?? Circle;
  return (
    <Link
      href={item.href}
      title={item.label}
      className={`mx-1 flex items-center gap-2 rounded px-2 py-1.5 text-[12px] ${
        active
          ? "bg-[var(--color-muted)] font-medium text-[var(--color-foreground)]"
          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/60 hover:text-[var(--color-foreground)]"
      } ${collapsed ? "justify-center px-0" : ""}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}

export function OperatorPage({
  title,
  subtitle,
  actions,
  children,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function OperatorMetricStrip({
  metrics,
}: {
  readonly metrics: readonly { label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="bg-[var(--color-surface)] px-3 py-2.5">
          <p className="text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
            {m.label}
          </p>
          <p className="mt-1 font-mono text-sm font-medium tabular-nums">{m.value}</p>
        </div>
      ))}
    </div>
  );
}

export function OperatorPanel({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-[var(--color-border)]">
      <h2 className="border-b border-[var(--color-border)] px-3 py-2 text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
        {title}
      </h2>
      <div className="p-3">{children}</div>
    </section>
  );
}
