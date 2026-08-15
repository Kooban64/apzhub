"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Full-bleed Superadmin canvas — not a centered admin dump. */
export function ConsoleCanvas({
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
    <div className="flex h-full min-h-0 w-full flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5">
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-[11px] text-[var(--color-muted-foreground)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}

/** Master–detail workbench: list rail + inspector. */
export function ConsoleSplit({
  list,
  detail,
  listWidthClass = "w-[min(100%,280px)]",
}: {
  readonly list: ReactNode;
  readonly detail: ReactNode;
  readonly listWidthClass?: string;
}) {
  return (
    <div className="flex h-full min-h-[420px] flex-col md:flex-row">
      <aside
        className={`shrink-0 border-b border-[var(--color-border)] md:border-r md:border-b-0 ${listWidthClass}`}
      >
        {list}
      </aside>
      <section className="min-w-0 flex-1">{detail}</section>
    </div>
  );
}

export function ConsoleListHeader({
  title,
  count,
  actions,
}: {
  readonly title: string;
  readonly count?: number;
  readonly actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
          {title}
        </span>
        {typeof count === "number" ? (
          <span className="font-mono text-[11px] tabular-nums text-[var(--color-muted-foreground)]">
            {count}
          </span>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function ConsoleListButton({
  active,
  title,
  meta,
  onClick,
}: {
  readonly active: boolean;
  readonly title: string;
  readonly meta?: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-start gap-0.5 border-b border-[var(--color-border)] px-3 py-2.5 text-left transition-colors ${
        active ? "bg-[var(--color-muted)]" : "hover:bg-[var(--color-muted)]/50"
      }`}
    >
      <span className="text-[13px] font-medium">{title}</span>
      {meta ? (
        <span className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
          {meta}
        </span>
      ) : null}
    </button>
  );
}

export function ConsoleInspector({
  title,
  subtitle,
  actions,
  children,
  empty,
}: {
  readonly title?: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly empty?: string;
}) {
  if (!title && empty) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center px-6">
        <p className="max-w-sm text-center text-xs text-[var(--color-muted-foreground)]">
          {empty}
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <div className="min-w-0">
          {title ? (
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="mt-0.5 font-mono text-[11px] text-[var(--color-muted-foreground)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="flex-1 space-y-4 overflow-auto p-4">{children}</div>
    </div>
  );
}

export function ConsoleField({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-center">
      <dt className="text-[11px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
        {label}
      </dt>
      <dd className="text-[13px]">{children}</dd>
    </div>
  );
}

export function ConsoleStatusPill({
  tone,
  children,
}: {
  readonly tone: "ok" | "warn" | "danger" | "neutral" | "info";
  readonly children: ReactNode;
}) {
  const tones: Record<typeof tone, string> = {
    ok: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    warn: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
    danger: "bg-red-500/15 text-red-700 dark:text-red-300",
    neutral: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
    info: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ConsoleChip({ children }: { readonly children: ReactNode }) {
  return (
    <span className="inline-flex rounded border border-[var(--color-border)] bg-[var(--color-background)] px-1.5 py-0.5 font-mono text-[10px]">
      {children}
    </span>
  );
}

export function ConsoleBtn({
  variant = "secondary",
  disabled,
  onClick,
  children,
  type = "button",
}: {
  readonly variant?: "primary" | "secondary" | "danger" | "ghost";
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly children: ReactNode;
  readonly type?: "button" | "submit";
}) {
  const styles = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90",
    secondary:
      "border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-muted)]/60",
    danger:
      "border border-red-500/40 text-red-700 hover:bg-red-500/10 dark:text-red-300",
    ghost: "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/60",
  } as const;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 items-center justify-center rounded px-3 text-xs font-medium disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function ConsoleInput({
  value,
  onChange,
  placeholder,
  mono,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly placeholder?: string;
  readonly mono?: boolean;
}) {
  return (
    <input
      className={`h-8 w-full rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs outline-none focus:border-[var(--color-primary)] ${
        mono ? "font-mono" : ""
      }`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/** Overview posture zone — purpose + signal + CTA, not a naked metric. */
export function ConsolePostureZone({
  icon: Icon,
  label,
  value,
  detail,
  href,
  tone = "neutral",
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly href: string;
  readonly tone?: "ok" | "warn" | "danger" | "neutral" | "info";
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 bg-[var(--color-surface)] p-3 transition-colors hover:bg-[var(--color-muted)]/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </span>
        <ConsoleStatusPill tone={tone}>{value}</ConsoleStatusPill>
      </div>
      <p className="text-[12px] leading-snug text-[var(--color-foreground)]">
        {detail}
      </p>
      <span className="text-[11px] text-[var(--color-primary)] opacity-80 group-hover:opacity-100">
        Open →
      </span>
    </Link>
  );
}

export function ConsoleSection({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--color-border)] last:border-b-0">
      <div className="flex flex-wrap items-end justify-between gap-2 px-4 py-3">
        <div>
          <h2 className="text-[11px] font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-[12px] text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

export function ConsoleEmpty({ children }: { readonly children: ReactNode }) {
  return (
    <div className="rounded border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-xs text-[var(--color-muted-foreground)]">
      {children}
    </div>
  );
}

export function ConsoleBanner({
  tone = "info",
  children,
}: {
  readonly tone?: "info" | "warn" | "ok";
  readonly children: ReactNode;
}) {
  const bg =
    tone === "warn"
      ? "border-amber-500/40 bg-amber-500/10"
      : tone === "ok"
        ? "border-emerald-500/40 bg-emerald-500/10"
        : "border-[var(--color-border)] bg-[var(--color-muted)]/40";
  return <div className={`rounded border px-3 py-2 text-xs ${bg}`}>{children}</div>;
}
