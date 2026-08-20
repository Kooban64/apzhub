"use client";

import { signUp } from "@apzhub/auth";
import { Button, Input } from "@apzhub/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import {
  onboardingOrganisationPath,
  resolveCommerceCart,
  writeCommerceCartToStorage,
  type CommerceCart,
} from "@/lib/commercial/commerce-cart";

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resolved = resolveCommerceCart(searchParams);
    setCart(resolved);
    if (resolved) writeCommerceCartToStorage(resolved);
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!agree) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }
    setLoading(true);
    setError(null);
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const result = await signUp.email({ name, email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Registration failed");
      return;
    }
    const dest = cart ? onboardingOrganisationPath(cart) : "/workspace/home";
    router.push(dest);
    router.refresh();
  }

  return (
    <div data-testid="register-form">
      {cart ? (
        <p className="mb-4 text-xs text-[var(--color-muted-foreground)]">
          After account creation you will set up your organisation for{" "}
          <span className="font-mono">{cart.packageIds.join(", ")}</span>.
        </p>
      ) : null}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="First name"
          name="firstName"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <label className="flex items-start gap-2 text-xs text-[var(--color-muted-foreground)]">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            data-testid="register-agree"
          />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          className="h-10 w-full"
          disabled={loading || !agree}
          data-testid="register-submit"
        >
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--color-muted-foreground)]">
        Already have an account?{" "}
        <Link
          href={
            cart
              ? `/login?callbackUrl=${encodeURIComponent(onboardingOrganisationPath(cart))}`
              : "/login"
          }
          className="underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-[var(--color-muted-foreground)]">Loading…</div>
      }
    >
      <RegisterFormInner />
    </Suspense>
  );
}
