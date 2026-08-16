"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type ProvisionStatus = {
  overall: "pending" | "ready" | "partial";
  steps: Array<{ id: string; label: string; status: string }>;
  productKeys: string[];
  packageId?: string;
};

function ProcessingInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const payfast = searchParams.get("payfast");
  const [status, setStatus] = useState<ProvisionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (payfast === "cancel") {
      router.replace("/checkout/fail?payfast=cancel");
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch("/api/v1/commerce/provisioning/status");
        if (res.status === 401) {
          router.replace(
            `/login?callbackUrl=${encodeURIComponent("/checkout/processing")}`,
          );
          return;
        }
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const body = (await res.json()) as { data?: ProvisionStatus };
        if (cancelled) return;
        setStatus(body.data ?? null);
        if (body.data?.overall === "ready" || body.data?.overall === "partial") {
          router.replace(
            body.data.overall === "ready"
              ? "/checkout/success"
              : "/checkout/success?partial=1",
          );
          return;
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
      attempts += 1;
      if (!cancelled && attempts < 20) {
        window.setTimeout(() => void poll(), 1500);
      } else if (!cancelled && attempts >= 20) {
        router.replace("/checkout/success?partial=1");
      }
    };
    void poll();
    return () => {
      cancelled = true;
    };
  }, [payfast, router]);

  return (
    <div
      className="mx-auto max-w-lg px-4 py-16 sm:px-8"
      data-testid="checkout-processing"
    >
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Processing payment…
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        We are confirming your payment with PayFast and preparing your workspace.
        Subscription activates only after server-side verification.
      </p>
      {error ? (
        <p className="mt-4 text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="mt-8 space-y-3" aria-live="polite">
        {(
          status?.steps ?? [
            { id: "payment", label: "Verifying payment", status: "pending" },
            { id: "organisation", label: "Organisation", status: "pending" },
            { id: "workspace", label: "Workspace", status: "pending" },
          ]
        ).map((step) => (
          <li
            key={step.id}
            className="flex items-center justify-between border-b border-[var(--color-border)] py-2 text-sm"
          >
            <span>{step.label}</span>
            <span className="text-[var(--color-muted-foreground)] capitalize">
              {step.status}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">
        <Link href="/workspace/billing" className="underline">
          Billing workspace
        </Link>
      </p>
    </div>
  );
}

export default function CheckoutProcessingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Processing…</div>}>
      <ProcessingInner />
    </Suspense>
  );
}
