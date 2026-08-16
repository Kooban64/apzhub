"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ProvisioningProgress } from "@/components/commerce/provisioning-progress";

function SuccessInner() {
  const searchParams = useSearchParams();
  const partial = searchParams.get("partial") === "1";
  const [productKeys, setProductKeys] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/commerce/provisioning/status");
        if (!res.ok) return;
        const body = (await res.json()) as {
          data?: { productKeys?: string[] };
        };
        if (!cancelled) setProductKeys(body.data?.productKeys ?? []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-8" data-testid="checkout-success">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        {partial ? "Workspace ready with partial setup" : "Payment confirmed"}
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        {partial
          ? "Some products may still be finishing. You can enter your workspace now — operations has been notified of any remaining steps."
          : "Your subscription authorisation is confirmed. Products and seats below are ready for setup."}
      </p>
      {productKeys.length > 0 ? (
        <ul className="mt-6 list-inside list-disc text-sm">
          {productKeys.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      ) : null}
      <ProvisioningProgress className="mt-8" />
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/onboarding/welcome"
          className="rounded-[var(--marketing-radius-control,0.5rem)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)]"
          data-testid="checkout-continue-setup"
        >
          Continue setup
        </Link>
        <Link
          href="/workspace/home"
          className="rounded-[var(--marketing-radius-control,0.5rem)] border border-[var(--color-border)] px-5 py-2.5 text-sm"
        >
          Enter workspace
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
