"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button, Input } from "@apzhub/ui";

import {
  resolveCommerceCart,
  writeCommerceCartToStorage,
  type CommerceCart,
} from "@/lib/commercial/commerce-cart";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function OrganisationOnboardingFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [country, setCountry] = useState("ZA");
  const [timezone, setTimezone] = useState("Africa/Johannesburg");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resolved = resolveCommerceCart(searchParams);
    setCart(resolved);
    if (resolved) writeCommerceCartToStorage(resolved);
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const slug = slugify(workspaceName || name);
      const res = await fetch("/api/v1/commerce/onboarding/organisation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          packageIds: cart?.packageIds,
          planId: cart?.planId ?? "plan.business",
          seats: cart?.seats ?? 1,
          countryCode: country,
          timezone,
        }),
      });
      const body = (await res.json()) as {
        data?: { checkoutHref?: string };
        error?: { message?: string };
      };
      if (res.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent("/onboarding/organisation")}`,
        );
        return;
      }
      if (!res.ok) {
        throw new Error(body.error?.message ?? `Onboarding failed (${res.status})`);
      }
      const href = body.data?.checkoutHref ?? "/pricing/checkout?plan=plan.business";
      router.push(href);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="mx-auto max-w-lg px-4 py-12 sm:px-8"
      data-testid="organisation-setup"
    >
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Set up your organisation
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        Only the information needed to create your workspace.
      </p>
      {cart ? (
        <p className="mt-2 font-mono text-xs text-[var(--color-muted-foreground)]">
          Packages: {cart.packageIds.join(", ")} · {cart.planId}
        </p>
      ) : null}

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Organisation name"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!workspaceName) setWorkspaceName(e.target.value);
          }}
          required
          data-testid="onboarding-org-name"
        />
        <Input
          label="Workspace name"
          name="workspaceName"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          required
          data-testid="onboarding-workspace-name"
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Country</span>
          <select
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            data-testid="onboarding-country"
          >
            <option value="ZA">South Africa</option>
            <option value="GB">United Kingdom</option>
            <option value="US">United States</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Timezone</span>
          <select
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            data-testid="onboarding-timezone"
          >
            <option value="Africa/Johannesburg">Africa/Johannesburg</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={loading || !name.trim() || !workspaceName.trim()}
          data-testid="onboarding-org-submit"
        >
          {loading ? "Creating…" : "Continue →"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
        <Link href="/marketplace" className="underline">
          Back to marketplace
        </Link>
      </p>
    </div>
  );
}

export function OrganisationOnboardingForm() {
  return (
    <Suspense fallback={<div className="p-12 text-sm">Loading…</div>}>
      <OrganisationOnboardingFormInner />
    </Suspense>
  );
}
