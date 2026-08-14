"use client";

import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@apzhub/ui";

import type { MarketingSiteConfig } from "@/lib/marketing/sites";

export function MarketingHeader({ site }: { readonly site: MarketingSiteConfig }) {
  const [openServices, setOpenServices] = useState<string | false>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const homeHref = site.pathPrefix || "/";

  return (
    <header className="relative z-30 border-b border-[var(--color-border)]/70 bg-[var(--color-background)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link
          href={homeHref}
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight sm:text-xl"
        >
          {site.brand}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) =>
            item.children?.length ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenServices(item.href)}
                onMouseLeave={() => setOpenServices(false)}
              >
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                >
                  {item.label}
                </Link>
                {openServices === item.href ? (
                  <div className="absolute top-full left-0 min-w-56 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            Menu
          </button>
          <Link
            href="/login"
            className="hidden text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] sm:inline"
          >
            Sign in
          </Link>
          <Link
            href={site.primaryCta.href}
            className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
          >
            {site.id === "hub" ? "Get started" : site.primaryCta.label}
          </Link>
          <ThemeToggle />
        </div>
      </div>
      {mobileOpen ? (
        <div className="border-t border-[var(--color-border)] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1 text-[var(--color-muted-foreground)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="py-1" onClick={() => setMobileOpen(false)}>
              Sign in
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
