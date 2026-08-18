"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@apzhub/ui";

const TITLE_BY_PATH: Record<string, string> = {
  "/login": "Sign in",
  "/register": "Create your APZ account",
  "/forgot-password": "Reset your password",
  "/reset-password": "Choose a new password",
  "/verify": "Verify your email",
};

const BLURB_BY_PATH: Record<string, string> = {
  "/login": "Access your organisation workbench with a single sign-in.",
  "/register": "Create an account to start your organisation workspace.",
  "/forgot-password": "Enter your email and we'll send you a password reset link.",
  "/reset-password": "Choose a strong password to regain access to your account.",
  "/verify": "Confirm your email so we can restore your checkout state.",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = TITLE_BY_PATH[pathname] ?? "Account";
  const blurb = BLURB_BY_PATH[pathname] ?? "APZ account access.";

  return (
    <div className="grid min-h-full lg:grid-cols-[minmax(280px,42%)_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-[var(--color-border)] lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, var(--color-surface), var(--color-background))",
          }}
        />
        <div className="relative z-10 flex flex-1 flex-col justify-between p-8 xl:p-10">
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-display,var(--font-sans))] text-xl font-semibold tracking-tight"
            >
              APZ
            </Link>
            <p className="mt-8 max-w-sm text-3xl leading-tight font-semibold tracking-tight xl:text-4xl">
              One platform for better work.
              <span className="mt-2 block text-[var(--color-muted-foreground)]">
                Productivity · Quality · Security
              </span>
            </p>
            <ul className="mt-10 max-w-sm space-y-4 text-sm text-[var(--color-muted-foreground)]">
              <li className="border-l-2 border-[var(--color-primary)] pl-3">
                APZPRD — get work done
              </li>
              <li className="border-l-2 border-[var(--color-primary)] pl-3">
                APZQEP — build with confidence
              </li>
              <li className="border-l-2 border-[var(--color-primary)] pl-3">
                APZPEN — test with confidence
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-muted-foreground)]">
            <Link href="/products" className="hover:text-[var(--color-foreground)]">
              Products
            </Link>
            <Link href="/pricing" className="hover:text-[var(--color-foreground)]">
              Pricing
            </Link>
            <Link href="/legal/terms" className="hover:text-[var(--color-foreground)]">
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-[var(--color-foreground)]"
            >
              Privacy
            </Link>
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-full flex-col bg-[var(--color-background)]">
        <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              APZ
            </Link>
            <span className="text-[var(--color-muted-foreground)]" aria-hidden>
              |
            </span>
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {title}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] sm:inline"
            >
              Back to site
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 hidden lg:block">
              <p className="text-xs font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
                APZ
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display,var(--font-sans))] text-3xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {blurb}
              </p>
            </div>
            <div className="mb-6 lg:hidden">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {blurb}
              </p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
