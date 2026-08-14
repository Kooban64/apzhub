"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Plan = {
  planId: string;
  name: string;
  tagline: string;
  amountCents: number;
  currency: string;
  interval: string;
  products: string[];
  selfServe: boolean;
  trialDays: number;
  highlights: string[];
};

function formatMoney(cents: number, currency: string): string {
  if (cents <= 0) return "Custom";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function PricingCards() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/billing/catalogue");
        const body = (await res.json()) as {
          data?: { plans?: Plan[] };
          error?: { message?: string };
        };
        if (!res.ok) {
          throw new Error(body.error?.message ?? `Catalogue failed (${res.status})`);
        }
        if (!cancelled) setPlans(body.data?.plans ?? []);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="text-sm text-[var(--color-destructive)]" role="alert">
        {error}
      </p>
    );
  }

  if (!plans) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">Loading plans…</p>
    );
  }

  const ordered = ["plan.individual", "plan.business", "plan.custom"]
    .map((id) => plans.find((p) => p.planId === id))
    .filter(Boolean) as Plan[];

  return (
    <div className="grid gap-6 md:grid-cols-3" data-testid="pricing-cards">
      {ordered.map((plan) => (
        <article
          key={plan.planId}
          className="flex flex-col border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          data-testid={`pricing-card-${plan.planId}`}
        >
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {plan.name}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {plan.tagline}
          </p>
          <p className="mt-6 text-3xl font-semibold tracking-tight">
            {formatMoney(plan.amountCents, plan.currency)}
            {plan.amountCents > 0 ? (
              <span className="text-sm font-normal text-[var(--color-muted-foreground)]">
                /{plan.interval}
              </span>
            ) : null}
          </p>
          {plan.trialDays > 0 ? (
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {plan.trialDays}-day trial · card required
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Sales-assisted quote
            </p>
          )}
          <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            {plan.highlights.map((line) => (
              <li key={line}>— {line}</li>
            ))}
          </ul>
          <div className="mt-8">
            {plan.selfServe ? (
              <Link
                href={`/pricing/checkout?plan=${encodeURIComponent(plan.planId)}`}
                className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
              >
                Start trial
              </Link>
            ) : (
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-muted)]"
              >
                Contact sales
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
