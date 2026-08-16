import Link from "next/link";

import {
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";
import { PUBLIC_PRODUCT_CATALOGUE } from "@/lib/marketing/product-catalogue";

const PILLAR_LABEL = {
  quality: "Quality",
  security: "Security",
  productivity: "Productivity",
} as const;

export default function ProductsIndexPage() {
  return (
    <MarketingSection>
      <MarketingEyebrow>Products</MarketingEyebrow>
      <MarketingHeading>Choose only what you need</MarketingHeading>
      <MarketingLead>
        Capabilities are independently entitleable. Start with one product and add more
        when your organisation is ready.
      </MarketingLead>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PUBLIC_PRODUCT_CATALOGUE.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-primary)]/50"
            style={{ borderRadius: "var(--marketing-radius-card)" }}
            data-testid={`product-card-${product.id}`}
          >
            <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--color-muted-foreground)] uppercase">
              {PILLAR_LABEL[product.pillar]}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold">
              {product.name}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              {product.summary}
            </p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm">
        <Link href="/marketplace" className="text-[var(--color-primary)] underline">
          Open marketplace
        </Link>
      </p>
    </MarketingSection>
  );
}
