import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

export default function CaseStudiesPage() {
  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>Case studies</MarketingEyebrow>
      <MarketingHeading as="h1">Featured engagements</MarketingHeading>
      <MarketingLead>
        Representative outcomes — detailed client stories published as programmes
        mature.
      </MarketingLead>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            t: "QA transformation",
            d: "Automated testing implementation that reduced release times and improved stability.",
          },
          {
            t: "Application security assessment",
            d: "Comprehensive pentesting that identified critical attack paths before launch.",
          },
          {
            t: "Continuous assurance programme",
            d: "Ongoing quality and security testing integrated into development pipelines.",
          },
        ].map((item) => (
          <article
            key={item.t}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <h2 className="font-medium">{item.t}</h2>
            <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
              {item.d}
            </p>
          </article>
        ))}
      </div>
      <MarketingCtaGroup
        primary={{ href: "/contact", label: "Request a relevant reference" }}
      />
    </MarketingSection>
  );
}
