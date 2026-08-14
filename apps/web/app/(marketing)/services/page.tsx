import Link from "next/link";

import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingPillarCard,
  MarketingSection,
} from "@/components/marketing/marketing-ui";
import { PRODUCTIVITY_BUNDLE } from "@/lib/marketing/sites";

export default function ServicesOverviewPage() {
  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>Services</MarketingEyebrow>
      <MarketingHeading as="h1">Explore our services</MarketingHeading>
      <MarketingLead>
        APZHUB sells outcomes through specialised brands and a future productivity
        bundle — one platform login underneath.
      </MarketingLead>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <MarketingPillarCard
          title="Quality Assurance"
          description="APZQA — functional, regression, mobile, performance, and automation."
          items={["Manual & automation", "QEP quality gate on platform"]}
          href="/qa"
        />
        <MarketingPillarCard
          title="Penetration Testing"
          description="APZPenTest — web, API, mobile, cloud, network, and red team."
          items={["Manual-first", "Separate commercial SKU from QA"]}
          href="/pentest"
        />
        <MarketingPillarCard
          title="Security Assessments"
          description="Compliance-oriented assurance programmes mapped to common frameworks."
          items={["SOC 2", "ISO 27001", "HIPAA / PCI paths"]}
          href="/services/security-assessments"
        />
        <MarketingPillarCard
          title={PRODUCTIVITY_BUNDLE.name}
          badge="Coming soon"
          description={PRODUCTIVITY_BUNDLE.description}
          items={PRODUCTIVITY_BUNDLE.products.map((p) => p.name)}
          href="/productivity"
        />
      </div>
      <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
        Prefer a direct brand URL later:{" "}
        <Link href="/qa" className="underline">
          apzqa / apzqep
        </Link>
        ,{" "}
        <Link href="/pentest" className="underline">
          apzpentest
        </Link>
        .
      </p>
      <MarketingCtaGroup primary={{ href: "/contact", label: "Book a consultation" }} />
    </MarketingSection>
  );
}
