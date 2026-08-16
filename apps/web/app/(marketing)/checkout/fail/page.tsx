"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { checkoutPath, resolveCommerceCart } from "@/lib/commercial/commerce-cart";

function FailInner() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("payfast") === "cancel";
  const cart = resolveCommerceCart(searchParams);
  const retryHref = checkoutPath(cart);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-8" data-testid="checkout-fail">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        {cancelled ? "Payment cancelled" : "Payment unsuccessful"}
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        No subscription was activated. Your package selection and organisation were
        preserved — you can try again without starting over.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={retryHref}
          className="rounded-[var(--marketing-radius-control,0.5rem)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)]"
          data-testid="checkout-try-again"
        >
          Try again
        </Link>
        <Link
          href="/contact"
          className="rounded-[var(--marketing-radius-control,0.5rem)] border border-[var(--color-border)] px-5 py-2.5 text-sm"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading…</div>}>
      <FailInner />
    </Suspense>
  );
}
