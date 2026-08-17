/**
 * Shared Tenant Admin visual primitives — dense enterprise, restrained.
 * Visual pass only; no business logic.
 */

import type { ReactNode } from "react";
import { Search } from "lucide-react";

export function OrgAdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function OrgAdminSecondaryTabs<T extends string>({
  tabs,
  value,
  onChange,
  testIdPrefix,
}: {
  readonly tabs: readonly { readonly id: T; readonly label: string }[];
  readonly value: T;
  readonly onChange: (id: T) => void;
  readonly testIdPrefix: string;
}) {
  return (
    <div
      className="flex flex-wrap gap-0 border-b border-[var(--color-border)]"
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-xs ${
              active
                ? "border-[var(--color-foreground)] font-medium text-[var(--color-foreground)]"
                : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            }`}
            data-testid={`${testIdPrefix}-${tab.id}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function OrgAdminFilterBar({ children }: { readonly children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 py-2">{children}</div>;
}

export function OrgAdminSearchInput({
  value,
  onChange,
  placeholder,
  testId,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly testId?: string;
}) {
  return (
    <label className="relative flex min-w-[12rem] flex-1 items-center gap-1.5 border border-[var(--color-border)] px-2 py-1.5">
      <Search
        className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted-foreground)]"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs outline-none"
        data-testid={testId}
      />
    </label>
  );
}

export function OrgAdminSelect({
  disabled,
  title,
  children,
  value,
  onChange,
}: {
  readonly disabled?: boolean;
  readonly title?: string;
  readonly children: ReactNode;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
}) {
  return (
    <select
      className={`border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs ${
        disabled ? "opacity-50" : ""
      }`}
      disabled={disabled}
      title={title}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    >
      {children}
    </select>
  );
}

export function OrgAdminStatusDot({
  label,
  tone = "neutral",
}: {
  readonly label: string;
  readonly tone?: "ok" | "neutral" | "warn" | "bad";
}) {
  const color =
    tone === "ok"
      ? "bg-[var(--color-foreground)]"
      : tone === "warn"
        ? "bg-[var(--color-muted-foreground)]"
        : tone === "bad"
          ? "bg-[var(--color-destructive)]"
          : "bg-[var(--color-muted-foreground)]";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs capitalize">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} aria-hidden />
      {label}
    </span>
  );
}

/** Wide structured field row — label left, value right. */
export function OrgAdminFieldRow({
  label,
  children,
  testId,
}: {
  readonly label: string;
  readonly children: ReactNode;
  readonly testId?: string;
}) {
  return (
    <div
      className="grid grid-cols-[minmax(10rem,14rem)_1fr] gap-x-6 gap-y-1 border-b border-[var(--color-border)]/60 py-2.5 last:border-b-0"
      data-testid={testId}
    >
      <dt className="text-xs text-[var(--color-muted-foreground)]">{label}</dt>
      <dd className="text-xs text-[var(--color-foreground)]">{children}</dd>
    </div>
  );
}

export function OrgAdminSectionTitle({ children }: { readonly children: ReactNode }) {
  return (
    <h2 className="mb-1 pt-3 text-[11px] font-semibold tracking-wide uppercase">
      {children}
    </h2>
  );
}

export function OrgAdminFieldValue({
  availability,
  value,
  message,
  managedBy,
}: {
  readonly availability: string;
  readonly value?: string | number;
  readonly message?: string;
  readonly managedBy?: "platform" | "organisation";
}) {
  if (availability === "not_configured") {
    return (
      <span data-availability="not_configured">
        <span className="font-medium">Not configured</span>
        {message ? (
          <span className="text-[var(--color-muted-foreground)]"> — {message}</span>
        ) : null}
      </span>
    );
  }
  if (availability === "unavailable") {
    return (
      <span data-availability="unavailable">
        <span className="font-medium">Unavailable</span>
        {message ? (
          <span className="text-[var(--color-muted-foreground)]"> — {message}</span>
        ) : null}
      </span>
    );
  }
  return (
    <span data-availability={availability}>
      <span>{value ?? "—"}</span>
      {managedBy === "platform" ? (
        <span className="mt-0.5 block text-[11px] text-[var(--color-muted-foreground)]">
          Managed by APZ Platform
        </span>
      ) : null}
      {managedBy === "organisation" ? (
        <span className="mt-0.5 block text-[11px] text-[var(--color-muted-foreground)]">
          Organisation configurable
        </span>
      ) : null}
    </span>
  );
}

/** Compact empty / not-configured — never a giant hero empty state. */
export function OrgAdminEmptyState({
  title,
  message,
  testId,
}: {
  readonly title: string;
  readonly message: string;
  readonly testId?: string;
}) {
  return (
    <div className="py-6 text-xs" data-testid={testId}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-lg text-[var(--color-muted-foreground)]">{message}</p>
    </div>
  );
}

export function OrgAdminNotConfigured({
  title,
  message,
  testId,
}: {
  readonly title?: string;
  readonly message: string;
  readonly testId?: string;
}) {
  return (
    <div
      className="py-4 text-xs"
      data-testid={testId}
      data-availability="not_configured"
    >
      {title ? <p className="font-medium">{title}</p> : null}
      <p className={`${title ? "mt-1" : ""} text-[var(--color-muted-foreground)]`}>
        <span className="font-medium text-[var(--color-foreground)]">
          Not configured
        </span>
        {" — "}
        {message}
      </p>
    </div>
  );
}

export function OrgAdminTable({
  children,
  testId,
  minWidth = "40rem",
}: {
  readonly children: ReactNode;
  readonly testId?: string;
  readonly minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-xs"
        style={{ minWidth }}
        data-testid={testId}
      >
        {children}
      </table>
    </div>
  );
}

export function OrgAdminTh({ children }: { readonly children: ReactNode }) {
  return (
    <th className="border-b border-[var(--color-border)] px-2 py-2 text-[11px] font-medium text-[var(--color-muted-foreground)]">
      {children}
    </th>
  );
}

export function OrgAdminTd({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <td
      className={`border-b border-[var(--color-border)]/70 px-2 py-2 align-top ${className}`}
    >
      {children}
    </td>
  );
}

/** Source column: Direct | Team + name — no rainbow badges. */
export function OrgAdminAccessSource({
  provenance,
  label,
}: {
  readonly provenance: "direct" | "team";
  readonly label: string;
}) {
  if (provenance === "direct") {
    return (
      <span
        className="text-xs"
        data-testid="provenance-direct"
        data-provenance="direct"
      >
        Direct
      </span>
    );
  }
  const teamName = label
    .replace(/^Inherited from\s+/i, "")
    .replace(/^Team\s*[·.]\s*/i, "")
    .trim();
  return (
    <span
      className="flex flex-col text-xs leading-tight"
      data-testid="provenance-inherited"
      data-provenance="team"
    >
      <span>Team</span>
      <span className="text-[11px] text-[var(--color-muted-foreground)]">
        {teamName || "—"}
      </span>
    </span>
  );
}
