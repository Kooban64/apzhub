import Link from "next/link";

import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

const SERVICES = [
  {
    slug: "manual-testing",
    title: "Manual Testing",
    body: "Exploratory and scripted manual testing across critical user journeys.",
  },
  {
    slug: "automation-testing",
    title: "Automation Testing",
    body: "Sustainable automation frameworks integrated with your CI/CD pipelines.",
  },
  {
    slug: "performance-testing",
    title: "Performance Testing",
    body: "Validate scalability and responsiveness before peak load hits production.",
  },
  {
    slug: "security-testing",
    title: "Security Testing",
    body: "QA-layer security validation. For deep offensive engagements see APZPenTest.",
  },
  {
    slug: "mobile-testing",
    title: "Mobile Testing",
    body: "Coverage across devices, OS versions, and store-release criteria.",
  },
] as const;

export default function QaServicesIndexPage() {
  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>APZQA</MarketingEyebrow>
      <MarketingHeading as="h1">QA services</MarketingHeading>
      <MarketingLead>
        Choose an engagement focus — or ask us to assemble a blended quality programme.
      </MarketingLead>
      <ul className="mt-10 space-y-4">
        {SERVICES.map((service) => (
          <li key={service.slug}>
            <Link
              href={`/qa/services/${service.slug}`}
              className="block border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-primary)]/50"
            >
              <h2 className="font-medium">{service.title}</h2>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {service.body}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <MarketingCtaGroup
        primary={{ href: "/contact?intent=qa", label: "Get a quote" }}
      />
    </MarketingSection>
  );
}
