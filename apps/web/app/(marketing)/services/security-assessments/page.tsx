import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

export default function SecurityAssessmentsPage() {
  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>Security assessments</MarketingEyebrow>
      <MarketingHeading as="h1">Compliance-ready security programmes</MarketingHeading>
      <MarketingLead>
        Structured assessments that produce evidence stakeholders can use — paired with
        APZPenTest offensive testing when depth is required.
      </MarketingLead>
      <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
        <li>
          Control-oriented reviews mapped to SOC 2, ISO 27001, HIPAA, PCI DSS, GDPR
        </li>
        <li>Clear executive narrative plus technical backlog</li>
        <li>Optional offensive validation via APZPenTest scopes</li>
      </ul>
      <MarketingCtaGroup
        primary={{ href: "/contact?intent=security-assessment", label: "Talk to us" }}
        secondary={{ href: "/pentest", label: "APZPenTest" }}
      />
    </MarketingSection>
  );
}
