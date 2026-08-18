import Link from "next/link";

import {
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";
import { listPublicSuites } from "@/lib/marketing/product-catalogue";

const PILLAR_HEADING = {
  productivity: "Productivity",
  quality: "Quality Engineering",
  security: "Security Testing",
} as const;

const EXPLORE_LABEL = {
  productivity: "Explore Productivity →",
  quality: "Explore Quality →",
  security: "Explore Security →",
} as const;

export default function ProductsIndexPage() {
  const suites = listPublicSuites();

  return (
    <div data-testid="products-index">
      <MarketingSection>
        <MarketingEyebrow>Products</MarketingEyebrow>
        <MarketingHeading>Products</MarketingHeading>
        <MarketingLead>Choose the capabilities your organisation needs.</MarketingLead>

        <div className="mt-12 space-y-0">
          {suites.map((suite) => (
            <section
              key={suite.id}
              className="border-t border-[var(--color-border)] py-10"
              data-testid={`products-suite-${suite.id}`}
            >
              <p className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
                {PILLAR_HEADING[suite.pillar]}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
                {suite.code}
              </h2>
              <p className="mt-3 max-w-xl text-[var(--color-muted-foreground)]">
                {suite.summary}
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(suite.modules ?? []).map((mod) => (
                  <li key={mod} className="text-sm">
                    {mod}
                  </li>
                ))}
              </ul>
              <p className="mt-8">
                <Link
                  href={suite.href}
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  {EXPLORE_LABEL[suite.pillar]}
                </Link>
              </p>
            </section>
          ))}
        </div>
      </MarketingSection>
    </div>
  );
}
