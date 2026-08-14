import Link from "next/link";

import type { MarketingSiteConfig } from "@/lib/marketing/sites";

const LEGAL = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
] as const;

export function MarketingFooter({ site }: { readonly site: MarketingSiteConfig }) {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-12 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {site.brand}
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {site.tagline}
          </p>
          <p className="mt-4 text-xs text-[var(--color-muted-foreground)]">
            Powered by{" "}
            <Link href="/" className="underline hover:text-[var(--color-foreground)]">
              APZHUB
            </Link>
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Navigate</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            {site.nav.slice(0, 5).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[var(--color-foreground)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Products</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            <li>
              <Link href="/qa" className="hover:text-[var(--color-foreground)]">
                APZQA — Quality
              </Link>
            </li>
            <li>
              <Link href="/pentest" className="hover:text-[var(--color-foreground)]">
                APZPenTest — Security
              </Link>
            </li>
            <li>
              <Link
                href="/productivity"
                className="hover:text-[var(--color-foreground)]"
              >
                Productivity Suite — soon
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-[var(--color-foreground)]">
                Platform pricing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[var(--color-foreground)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-[var(--color-muted-foreground)]">
        © {new Date().getFullYear()} APZHUB. Quality and security decisions remain human
        — we assist; we do not auto-certify.
      </p>
    </footer>
  );
}
