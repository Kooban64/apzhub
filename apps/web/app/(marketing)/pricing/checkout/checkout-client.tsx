"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@apzhub/ui";

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan") ?? "plan.individual";
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string> | null>(null);

  if (planId === "plan.custom") {
    router.replace("/contact");
    return null;
  }

  async function startTrial() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing/subscriptions/start-trial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const body = (await res.json()) as {
        data?: {
          checkout?: { processUrl?: string; fields?: Record<string, string> };
          trialEndsAt?: string;
        };
        error?: { message?: string };
      };
      if (res.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(`/pricing/checkout?plan=${planId}`)}`,
        );
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
        Plan: <span className="font-mono">{planId}</span>. Card authorisation via
        PayFast is required. Subscription converts to paid after 7 days unless cancelled
        per Terms.
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
              , and trial billing notice.
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
            You must be signed in.{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Trial created. Submit the PayFast form to authorise your card.
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
          <Link href="/workspace/billing" className="text-sm underline">
            Go to billing workspace
          </Link>
        </div>
      )}
    </div>
  );
}
