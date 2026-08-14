import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingProcessSteps,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

export default function MethodologyPage() {
  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>Methodology</MarketingEyebrow>
      <MarketingHeading as="h1">How we engage</MarketingHeading>
      <MarketingLead>
        Transparent phases for quality and security work — with platform visibility for
        findings, remediation, and retest.
      </MarketingLead>
      <MarketingProcessSteps
        steps={[
          "Discovery",
          "Execution",
          "Reporting",
          "Collaboration",
          "Retest",
          "Improve",
        ]}
      />
      <ul className="mt-10 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
        <li>Scoped rules of engagement and asset inventory first</li>
        <li>Evidence captured into APZHUB for operators and auditors</li>
        <li>Human decision gates remain mandatory for certification outcomes</li>
      </ul>
      <MarketingCtaGroup
        primary={{ href: "/contact", label: "Start discovery" }}
        secondary={{ href: "/pentest", label: "APZPenTest" }}
      />
    </MarketingSection>
  );
}
