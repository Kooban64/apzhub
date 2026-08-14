import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

export default function ResourcesPage() {
  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>Resources</MarketingEyebrow>
      <MarketingHeading as="h1">Insights & expertise</MarketingHeading>
      <MarketingLead>
        Guides and notes across quality, security, and delivery — expanding as the
        practice library grows.
      </MarketingLead>
      <ul className="mt-8 space-y-3 text-sm">
        {[
          "Security research",
          "Testing best practices",
          "Automation guides",
          "Compliance resources",
          "Industry trends",
        ].map((label) => (
          <li
            key={label}
            className="border-b border-[var(--color-border)] py-3 text-[var(--color-muted-foreground)]"
          >
            {label}{" "}
            <span className="text-xs tracking-wide uppercase">· coming soon</span>
          </li>
        ))}
      </ul>
      <MarketingCtaGroup primary={{ href: "/contact", label: "Ask for a briefing" }} />
    </MarketingSection>
  );
}
