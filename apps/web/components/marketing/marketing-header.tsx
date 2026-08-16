"use client";

import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@apzhub/ui";

import type { MarketingSiteConfig } from "@/lib/marketing/sites";

export function MarketingHeader({ site }: { readonly site: MarketingSiteConfig }) {
  const [openMenu, setOpenMenu] = useState<string | false>(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const homeHref = site.pathPrefix || "/";

  return (
    <header className="relative z-30 border-b border-[var(--color-border)]/70 bg-[var(--color-background)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link
          href={homeHref}
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight sm:text-xl"
        >
          {site.brand === "APZHUB" ? "APZ" : site.brand}
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {site.nav.map((item) =>
            item.children?.length ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.href)}
                onMouseLeave={() => setOpenMenu(false)}
              >
                <Link
                  href={item.href}
                  className="rounded-[var(--marketing-radius-control,0.5rem)] px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  aria-expanded={openMenu === item.href}
                  aria-haspopup="true"
                >
                  {item.label}
                </Link>
                {openMenu === item.href ? (
                  <div
                    className="absolute top-full left-0 min-w-72 rounded-[var(--marketing-radius-card,0.625rem)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 shadow-lg"
                    role="menu"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        role="menuitem"
                        className="block px-4 py-3 text-sm hover:bg-[var(--color-muted)]"
                      >
                        <span className="font-medium text-[var(--color-foreground)]">
                          {child.label}
                        </span>
                        {child.description ? (
                          <span className="mt-0.5 block text-[var(--marketing-meta,0.75rem)] text-[var(--color-muted-foreground)]">
                            {child.description}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[var(--marketing-radius-control,0.5rem)] px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="rounded-[var(--marketing-radius-control,0.5rem)] border border-[var(--color-border)] px-2 py-1 text-xs md:hidden"
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
            className="rounded-[var(--marketing-radius-control,0.5rem)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
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
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  className="block py-1 font-medium text-[var(--color-foreground)]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block py-1 pl-3 text-[var(--color-muted-foreground)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
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
