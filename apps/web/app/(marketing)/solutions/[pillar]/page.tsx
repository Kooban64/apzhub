import Link from "next/link";
import { notFound } from "next/navigation";

import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";
import { getSolutionPillar } from "@/lib/marketing/solutions";

export default async function SolutionPillarPage({
  params,
}: {
  readonly params: Promise<{ readonly pillar: string }>;
}) {
  const { pillar: pillarId } = await params;
  const pillar = getSolutionPillar(pillarId);
  if (!pillar) notFound();

  return (
    <MarketingSection>
      <MarketingEyebrow>{pillar.eyebrow}</MarketingEyebrow>
      <MarketingHeading>
        {pillar.brand} — {pillar.title}
      </MarketingHeading>
      <MarketingLead>{pillar.summary}</MarketingLead>
      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        {pillar.highlights.map((item) => (
          <li
            key={item}
            className="border-l-2 border-[var(--color-primary)] pl-3 text-sm text-[var(--color-muted-foreground)]"
          >
            {item}
          </li>
        ))}
      </ul>
      <MarketingCtaGroup
        primary={pillar.cta}
        secondary={{ href: "/marketplace", label: "Browse marketplace" }}
      />
      <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
        <Link href="/solutions" className="underline">
          All solutions
        </Link>
      </p>
    </MarketingSection>
  );
}
