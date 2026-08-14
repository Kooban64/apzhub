import Link from "next/link";
import type { ReactNode } from "react";

export function MarketingSection({
  children,
  className = "",
  id,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly id?: string;
}) {
  return (
    <section id={id} className={`px-4 py-16 sm:px-8 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function MarketingEyebrow({ children }: { readonly children: ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-[0.22em] text-[var(--color-muted-foreground)] uppercase">
      {children}
    </p>
  );
}

export function MarketingHeading({
  children,
  as: Tag = "h2",
}: {
  readonly children: ReactNode;
  readonly as?: "h1" | "h2" | "h3";
}) {
  const sizes =
    Tag === "h1"
      ? "text-4xl sm:text-5xl md:text-6xl"
      : Tag === "h2"
        ? "text-3xl sm:text-4xl"
        : "text-xl sm:text-2xl";
  return (
    <Tag
      className={`font-[family-name:var(--font-display)] font-semibold tracking-tight text-[var(--color-foreground)] ${sizes}`}
    >
      {children}
    </Tag>
  );
}

export function MarketingLead({ children }: { readonly children: ReactNode }) {
  return (
    <p className="mt-4 max-w-2xl text-base text-[var(--color-muted-foreground)] sm:text-lg">
      {children}
    </p>
  );
}

export function MarketingCtaGroup({
  primary,
  secondary,
}: {
  readonly primary: { href: string; label: string };
  readonly secondary?: { href: string; label: string };
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={primary.href}
        className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
      >
        {primary.label}
      </Link>
      {secondary ? (
        <Link
          href={secondary.href}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-muted)]"
        >
          {secondary.label}
        </Link>
      ) : null}
    </div>
  );
}

export function MarketingPillarCard({
  title,
  description,
  items,
  href,
  badge,
}: {
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
  readonly href: string;
  readonly badge?: string;
}) {
  return (
    <article className="group flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-primary)]/50">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          {title}
        </h3>
        {badge ? (
          <span className="shrink-0 rounded border border-[var(--color-border)] px-2 py-0.5 text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{description}</p>
      {items.length > 0 ? (
        <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--color-muted-foreground)]">
          {items.map((item) => (
            <li key={item}>— {item}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 flex-1" />
      )}
      <Link
        href={href}
        className="mt-6 text-sm font-medium text-[var(--color-primary)] group-hover:underline"
      >
        Learn more →
      </Link>
    </article>
  );
}

export function MarketingMetric({
  value,
  label,
}: {
  readonly value: string;
  readonly label: string;
}) {
  return (
    <div>
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{label}</p>
    </div>
  );
}

export function MarketingProcessSteps({
  steps,
}: {
  readonly steps: readonly string[];
}) {
  return (
    <ol className="mt-8 flex flex-wrap items-center gap-2 text-sm sm:gap-3">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-medium">
            {step}
          </span>
          {index < steps.length - 1 ? (
            <span className="text-[var(--color-muted-foreground)]" aria-hidden>
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
