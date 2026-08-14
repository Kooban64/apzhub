import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

export default function AboutPage() {
  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>About APZHUB</MarketingEyebrow>
      <MarketingHeading as="h1">
        Enterprise operating platform for assurance
      </MarketingHeading>
      <MarketingLead>
        APZHUB is the workbench. APZQA and APZPenTest are the specialised engagement
        brands. The Productivity Suite (Projects, Time, Support, Documents) joins later
        as one bundle — same SSO, entitlements, and audit model.
      </MarketingLead>
      <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
        <li>Self-hosted, OSS-first platform architecture</li>
        <li>Human GO / NO-GO for quality certification — never auto-certify</li>
        <li>Product access: org subscription ∩ user grants ∩ RBAC</li>
      </ul>
      <MarketingCtaGroup
        primary={{ href: "/contact", label: "Contact us" }}
        secondary={{ href: "/pricing", label: "Pricing" }}
      />
    </MarketingSection>
  );
}
