"use client";

import Link from "next/link";

import type { ProductKey } from "@/lib/commercial/catalogue";
import { productDisplayName } from "@/lib/commercial/soft-product-access";
import type { ProductAccessDecision } from "@/lib/commercial/require-product-access";

type DenialReason = Exclude<ProductAccessDecision, { allowed: true }>["reason"];

const PILLAR_TITLE: Record<string, string> = {
  qep: "Quality (APZQEP)",
  pentest: "Security Assurance (APZPEN)",
  projects: "Projects",
};

function copyFor(
  productKey: ProductKey,
  reason: DenialReason,
): { title: string; description: string; primaryHref: string; primaryLabel: string } {
  const name = PILLAR_TITLE[productKey] ?? productDisplayName(productKey);
  if (reason === "org_not_subscribed") {
    return {
      title: `${name} not subscribed`,
      description: `Your organisation does not have an active ${name} subscription. An org admin can add the package from Org console, or review plans on Pricing.`,
      primaryHref: "/org",
      primaryLabel: "Open Org console",
    };
  }
  if (reason === "user_not_granted") {
    return {
      title: `${name} not granted to you`,
      description: `Your organisation has ${name}, but your account is not granted this product. Ask an org admin to enable it on your membership.`,
      primaryHref: "/org",
      primaryLabel: "Open Org · Members",
    };
  }
  return {
    title: `${name} unavailable`,
    description: `${name} is not available in this catalogue build. This is not a permission error — the product is marked unavailable or coming soon.`,
    primaryHref: "/pricing",
    primaryLabel: "View pricing",
  };
}

/**
 * Shared entitlement denial — SPR-POLISH-001.
 * Prefer reason-aware copy over generic “not entitled”.
 */
export function ProductAccessDeniedView({
  productKey,
  reason,
  breadcrumbs,
}: {
  readonly productKey: ProductKey;
  readonly reason: DenialReason;
  readonly breadcrumbs?: readonly string[];
}) {
  const copy = copyFor(productKey, reason);
  const crumbs = breadcrumbs ?? [
    PILLAR_TITLE[productKey] ?? productKey,
    "Product required",
  ];

  return (
    <div
      className="mx-auto flex max-w-lg flex-col gap-4 p-6"
      data-testid="product-access-denied"
      data-reason={reason}
      data-product={productKey}
    >
      <nav
        className="text-xs text-[var(--color-muted-foreground)]"
        aria-label="Breadcrumb"
      >
        {crumbs.join(" / ")}
      </nav>
      <h1 className="text-xl font-semibold tracking-tight">{copy.title}</h1>
      <p className="text-sm text-[var(--color-muted-foreground)]">{copy.description}</p>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Sign-in is BetterAuth only. Product access is org subscription ∩ user grant —
        not a separate engine login.
      </p>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={copy.primaryHref}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 hover:bg-[var(--color-muted)]"
        >
          {copy.primaryLabel}
        </Link>
        <Link
          href="/pricing"
          className="rounded-md px-3 py-2 text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          Pricing
        </Link>
      </div>
    </div>
  );
}
