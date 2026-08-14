import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

const INDUSTRIES = [
  "Financial Services",
  "Healthcare",
  "Insurance",
  "Telecommunications",
  "Retail",
  "Government",
  "SaaS & Technology",
  "Education",
] as const;

export default function IndustriesPage() {
  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>Industries</MarketingEyebrow>
      <MarketingHeading as="h1">Experience across multiple sectors</MarketingHeading>
      <MarketingLead>
        Regulated and high-growth environments alike — quality, security, and (soon)
        productivity on one platform.
      </MarketingLead>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {INDUSTRIES.map((name) => (
          <div
            key={name}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-sm font-medium"
          >
            {name}
          </div>
        ))}
      </div>
      <MarketingCtaGroup
        primary={{ href: "/contact", label: "Discuss your industry" }}
      />
    </MarketingSection>
  );
}
