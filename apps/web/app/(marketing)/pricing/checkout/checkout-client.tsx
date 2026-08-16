"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@apzhub/ui";

import {
  resolveCommerceCart,
  writeCommerceCartToStorage,
  type CommerceCart,
} from "@/lib/commercial/commerce-cart";
import { getPackage } from "@/lib/commercial/catalogue";

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const planId = searchParams.get("plan") ?? cart?.planId ?? "plan.individual";
  const packageId = searchParams.get("package") ?? cart?.packageId ?? "";
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const resolved = resolveCommerceCart(searchParams);
    setCart(resolved);
    if (resolved) writeCommerceCartToStorage(resolved);
  }, [searchParams]);

  if (planId === "plan.custom") {
    router.replace("/contact");
    return null;
  }

  const pkg = packageId ? getPackage(packageId) : undefined;

  async function startTrial() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing/subscriptions/start-trial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          planId,
          packageId: packageId || undefined,
        }),
      });
      const body = (await res.json()) as {
        data?: {
          checkout?: { processUrl?: string; fields?: Record<string, string> };
          trialEndsAt?: string;
          packageProvisioned?: { applied?: boolean; packageId?: string };
        };
        error?: { message?: string };
      };
      if (res.status === 401) {
        const cb = `/pricing/checkout?plan=${encodeURIComponent(planId)}${
          packageId ? `&package=${encodeURIComponent(packageId)}` : ""
        }`;
        router.push(`/login?callbackUrl=${encodeURIComponent(cb)}`);
        return;
      }
      if (!res.ok) {
        throw new Error(body.error?.message ?? `Trial start failed (${res.status})`);
      }
      setCheckoutUrl(body.data?.checkout?.processUrl ?? null);
      setFields(body.data?.checkout?.fields ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Start trial
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        Plan: <span className="font-mono">{planId}</span>
        {pkg ? (
          <>
            {" "}
            · Package: <span className="font-mono">{pkg.packageId}</span> ({pkg.name})
          </>
        ) : null}
        . Card authorisation via PayFast is required. This is a recurring subscription
        authorisation; converts to paid after 7 days unless cancelled per Terms.
      </p>

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
              </Link>
              ,{" "}
              <Link href="/legal/privacy" className="underline">
                Privacy Policy
              </Link>
              , recurring billing consent, and trial billing notice.
            </span>
          </label>
          {error ? (
            <p className="text-sm text-[var(--color-destructive)]" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={!agree || loading}
            onClick={() => void startTrial()}
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
            Trial created. Submit the PayFast form to authorise your card. After PayFast
            you will land on a processing screen — activation waits for server-side ITN
            verification (APZ never stores card details).
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
              <Button type="submit">Subscribe &amp; Pay with PayFast</Button>
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
            <Link href="/workspace/home" className="underline">
              Continue to workspace
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
