import Link from "next/link";

import {
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";
import { SOLUTION_PILLARS } from "@/lib/marketing/solutions";

export default function SolutionsIndexPage() {
  return (
    <MarketingSection>
      <MarketingEyebrow>Solutions</MarketingEyebrow>
      <MarketingHeading>Three disciplines. One platform.</MarketingHeading>
      <MarketingLead>
        Quality engineering, security assurance, and enterprise productivity — available
        independently or together under one identity and administration.
      </MarketingLead>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {SOLUTION_PILLARS.map((pillar) => (
          <Link
            key={pillar.id}
            href={pillar.href}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-primary)]/50"
            style={{ borderRadius: "var(--marketing-radius-card)" }}
            data-testid={`solutions-pillar-${pillar.id}`}
          >
            <p className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
              {pillar.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold">
              {pillar.brand}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              {pillar.summary}
            </p>
            <p className="mt-4 text-sm text-[var(--color-primary)]">Explore →</p>
          </Link>
        ))}
      </div>
    </MarketingSection>
  );
}
