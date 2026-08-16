"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { checkoutPath, resolveCommerceCart } from "@/lib/commercial/commerce-cart";

function VerifyInner() {
  const searchParams = useSearchParams();
  const cart = resolveCommerceCart(searchParams);
  const next = searchParams.get("callbackUrl") || checkoutPath(cart);

  return (
    <div className="space-y-4 text-sm" data-testid="auth-verify">
      <p className="text-[var(--color-muted-foreground)]">
        Check your email for a verification link. After you verify, you will return to
        your exact checkout state — your package selection is preserved.
      </p>
      <p className="text-[var(--color-muted-foreground)]">
        Email verification may be optional in this environment. You can continue when
        ready.
      </p>
      <div className="flex flex-col gap-3 pt-2">
        <Link
          href={next}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          data-testid="verify-continue"
        >
          Continue
        </Link>
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<p className="text-sm">Loading…</p>}>
      <VerifyInner />
    </Suspense>
  );
}
