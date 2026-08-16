import Link from "next/link";

import { MarketplacePackageList } from "@/components/marketing/marketplace-package-list";

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <p className="text-xs font-medium tracking-[0.22em] text-[var(--color-muted-foreground)] uppercase">
        Marketplace
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
        Choose what your organisation needs
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
        Self-serve packages for APZQEP, APZPEN, and APZPRD. Configure seats next, then
        create your organisation and start a card-authorised trial.
      </p>
      <div className="mt-10">
        <MarketplacePackageList />
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
