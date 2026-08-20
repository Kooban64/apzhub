"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@apzhub/ui";

import {
  commerceCartToQuery,
  resolveCommerceCart,
  writeCommerceCartToStorage,
  type CommerceCart,
} from "@/lib/commercial/commerce-cart";
import { getPackage } from "@/lib/commercial/catalogue";

type QuoteLine = {
  readonly packageId: string;
  readonly name: string;
  readonly amountCents: number;
  readonly currency: string;
};

type QuotePayload =
  | {
      readonly ok: true;
      readonly quoteId: string;
      readonly lines: readonly QuoteLine[];
      readonly subtotalCents: number;
      readonly discountCents?: number;
      readonly taxCents: number;
      readonly totalCents: number;
      readonly currency: string;
      readonly expiresAt?: string;
    }
  | {
      readonly ok: false;
      readonly code: string;
      readonly message: string;
      readonly missingPriceFields?: readonly string[];
    };

function formatMoney(cents: number, currency: string): string {
  if (cents <= 0) return "Pricing not available";
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [quote, setQuote] = useState<QuotePayload | null>(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const resolved = resolveCommerceCart(searchParams);
    setCart(resolved);
    if (resolved) writeCommerceCartToStorage(resolved);
  }, [searchParams]);

  useEffect(() => {
    if (!cart?.packageIds.length) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }
    const countryCode = searchParams.get("country")?.trim().toUpperCase() || "ZA";
    let cancelled = false;
    setQuoteLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/v1/commerce/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            packageIds: cart.packageIds,
            seats: cart.seats,
            countryCode,
          }),
        });
        const body = (await res.json()) as {
          data?: { quote?: QuotePayload };
        };
        if (!cancelled) {
          setQuote(body.data?.quote ?? null);
        }
      } catch {
        if (!cancelled) setQuote(null);
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cart, searchParams]);

  const packages = (cart?.packageIds ?? []).map((id) => getPackage(id)).filter(Boolean);

  async function startCheckout() {
    if (!cart?.packageIds.length) return;
    setLoading(true);
    setError(null);
    try {
      const countryCode = searchParams.get("country")?.trim().toUpperCase() || "ZA";
      const res = await fetch("/api/v1/commerce/checkout/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          packageIds: cart.packageIds,
          seats: cart.seats,
          planId: cart.planId,
          quoteId: quote && quote.ok ? quote.quoteId : undefined,
          countryCode,
        }),
      });
      const body = (await res.json()) as {
        data?: {
          checkout?: { processUrl?: string; fields?: Record<string, string> };
        };
        error?: { message?: string };
      };
      if (res.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(`/pricing/checkout?${commerceCartToQuery(cart)}`)}`,
        );
        return;
      }
      if (!res.ok) {
        throw new Error(body.error?.message ?? `Checkout failed (${res.status})`);
      }
      setCheckoutUrl(body.data?.checkout?.processUrl ?? null);
      setFields(body.data?.checkout?.fields ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const pricingBlocked = quote && !quote.ok && quote.code === "pricing_unavailable";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Checkout
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        Plan: <span className="font-mono">{cart?.planId ?? "plan.business"}</span>
        {packages.length > 0 ? (
          <>
            {" "}
            ·{" "}
            {packages.map((pkg) => (
              <span key={pkg!.packageId} className="font-mono">
                {pkg!.packageId}{" "}
              </span>
            ))}
          </>
        ) : null}
      </p>

      <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-medium">Order summary</h2>
        {quoteLoading ? (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Calculating…
          </p>
        ) : quote?.ok ? (
          <ul className="mt-3 space-y-2 text-sm">
            {quote.lines.map((line) => (
              <li key={line.packageId} className="flex justify-between gap-4">
                <span>{line.name}</span>
                <span>{formatMoney(line.amountCents, line.currency)}</span>
              </li>
            ))}
            {quote.taxCents > 0 ? (
              <li className="flex justify-between gap-4 text-[var(--color-muted-foreground)]">
                <span>VAT</span>
                <span>{formatMoney(quote.taxCents, quote.currency)}</span>
              </li>
            ) : null}
            <li className="flex justify-between gap-4 border-t border-[var(--color-border)] pt-2 font-medium">
              <span>Total</span>
              <span>{formatMoney(quote.totalCents, quote.currency)}</span>
            </li>
          </ul>
        ) : quote && !quote.ok ? (
          <p className="mt-2 text-sm text-[var(--color-destructive)]" role="alert">
            {quote.message}
            {quote.missingPriceFields?.length ? (
              <span className="mt-1 block font-mono text-xs">
                Owner fields: {quote.missingPriceFields.join(", ")}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Select products to continue.
          </p>
        )}
        <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
          Amounts are calculated server-side. PayFast receives the authoritative total
          only after validation.
        </p>
      </div>

      {!checkoutUrl ? (
        <div className="mt-8 space-y-4">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              data-testid="checkout-agree"
            />
            <span>
              I agree to the{" "}
              <Link href="/legal/terms" className="underline">
                Terms
              </Link>{" "}
              and recurring billing consent.
            </span>
          </label>
          {error ? (
            <p className="text-sm text-[var(--color-destructive)]" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={
              !agree ||
              loading ||
              quoteLoading ||
              !cart?.packageIds.length ||
              pricingBlocked ||
              (quote != null && !quote.ok)
            }
            onClick={() => void startCheckout()}
            data-testid="checkout-start-trial"
          >
            {loading ? "Starting…" : "Continue to PayFast"}
          </Button>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            You must be signed in with an organisation.{" "}
            <Link href="/onboarding/organisation" className="underline">
              Create organisation
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Submit the PayFast form to pay. After PayFast you will land on a processing
            screen — activation waits for server-side ITN verification.
          </p>
          {fields && checkoutUrl ? (
            <form
              method="POST"
              action={checkoutUrl}
              data-testid="payfast-checkout-form"
            >
              {Object.entries(fields).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
              <Button type="submit">Pay with PayFast</Button>
            </form>
          ) : null}
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="/checkout/processing?payfast=return"
              className="underline"
              data-testid="checkout-sandbox-return"
            >
              Sandbox: continue to processing (after PayFast return)
            </Link>
            <Link href="/checkout/fail?payfast=cancel" className="underline">
              Sandbox: simulate cancel
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
