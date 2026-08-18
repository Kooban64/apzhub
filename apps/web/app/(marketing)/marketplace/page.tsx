import Link from "next/link";

import { MarketplacePackageListPage } from "@/components/marketing/marketplace-package-list";

export default function MarketplacePage() {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-12 sm:px-8"
      data-testid="marketplace-page"
    >
      <p className="text-xs font-medium tracking-[0.22em] text-[var(--color-muted-foreground)] uppercase">
        Marketplace
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
        Products available for your organisation
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
        Commercial discovery and subscription management — not an app store. Choose
        APZPRD, APZQEP, and APZPEN packages from the durable catalogue.
      </p>
      <div className="mt-10">
        <MarketplacePackageListPage />
      </div>
      <p className="mt-10 text-sm text-[var(--color-muted-foreground)]">
        Prefer a plan overview?{" "}
        <Link href="/pricing" className="underline">
          View pricing
        </Link>
        .
      </p>
    </div>
  );
}
