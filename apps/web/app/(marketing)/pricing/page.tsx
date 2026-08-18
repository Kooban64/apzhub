import Link from "next/link";

import { PricingCards } from "./pricing-cards";
import { PublicProductPricing } from "./public-product-pricing";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
        Pricing
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
        Three plans. Individual and Business start with a 14-day trial — no card
        required. Custom is enterprise quote only.
      </p>
      <div className="mt-10">
        <PricingCards />
      </div>
      <PublicProductPricing />
      <p className="mt-10 text-sm text-[var(--color-muted-foreground)]">
        By starting a trial you agree to the{" "}
        <Link href="/legal/terms" className="underline">
          Terms
        </Link>
        ,{" "}
        <Link href="/legal/privacy" className="underline">
          Privacy Policy
        </Link>
        , and{" "}
        <Link href="/legal/disclaimer" className="underline">
          Disclaimer
        </Link>
        .
      </p>
    </div>
  );
}
