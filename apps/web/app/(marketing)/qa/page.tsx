import Link from "next/link";

import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingMetric,
  MarketingPillarCard,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

const QA_SERVICES = [
  {
    slug: "manual-testing",
    title: "Manual Testing",
    description:
      "Human-led exploration that catches unobvious UX and logic defects automation misses.",
  },
  {
    slug: "automation-testing",
    title: "Automation Testing",
    description:
      "Frameworks, CI/CD hooks, and regression suites that keep releases moving.",
  },
  {
    slug: "performance-testing",
    title: "Performance Testing",
    description:
      "Load, stress, and endurance checks so production traffic does not surprise you.",
  },
  {
    slug: "security-testing",
    title: "Security Testing",
    description: "QA-aligned security checks; deep offensive work lives on APZPenTest.",
  },
  {
    slug: "mobile-testing",
    title: "Mobile Testing",
    description: "Device and OS coverage for native and hybrid applications.",
  },
] as const;

export default function QaLandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 20% 0%, color-mix(in srgb, var(--color-success) 14%, transparent), transparent 50%), var(--color-background)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-8">
          <MarketingEyebrow>APZQA · Quality brand of APZHUB</MarketingEyebrow>
          <MarketingHeading as="h1">
            Stop losing customers to avoidable bugs
          </MarketingHeading>
          <MarketingLead>
            An independent software testing practice for web, mobile, and SaaS — manual
            and automated. Quality OS (QEP) keeps evidence and human GO / NO-GO gates on
            the same platform.
          </MarketingLead>
          <MarketingCtaGroup
            primary={{ href: "/contact?intent=qa", label: "Get a quote" }}
            secondary={{ href: "/qa/services", label: "Browse QA services" }}
          />
        </div>
      </section>

      <MarketingSection>
        <MarketingEyebrow>Address your QA challenges</MarketingEyebrow>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            {
              t: "Scale testing capacity",
              d: "Assurance teams that handle launch support, regression, and specialised QA software without hiring delays.",
            },
            {
              t: "Increase product quality",
              d: "In-depth testing so bugs never quietly erode retention, NPS, or revenue metrics.",
            },
            {
              t: "Faster time-to-market",
              d: "Expert practices and automation shorten feedback loops while keeping release confidence high.",
            },
          ].map((item) => (
            <article key={item.t}>
              <h2 className="font-medium">{item.t}</h2>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {item.d}
              </p>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        id="automation"
        className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/25"
      >
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <MarketingMetric value="300+" label="Products supported (programme goal)" />
          <MarketingMetric value="40%" label="Target reduction in release friction" />
          <MarketingMetric value="QEP" label="Evidence + human certification gate" />
          <MarketingMetric value="1 SSO" label="Same APZHUB login for operators" />
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)]">
        <MarketingEyebrow>Full-range QA services</MarketingEyebrow>
        <MarketingHeading>Services built for product teams</MarketingHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {QA_SERVICES.map((service) => (
            <MarketingPillarCard
              key={service.slug}
              title={service.title}
              description={service.description}
              items={[]}
              href={`/qa/services/${service.slug}`}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <MarketingEyebrow>On the same platform</MarketingEyebrow>
        <MarketingHeading>Quality meets the workbench</MarketingHeading>
        <MarketingLead>
          APZQA engagements feed APZHUB. When you also need offensive security, escalate
          to{" "}
          <Link href="/pentest" className="underline">
            APZPenTest
          </Link>
          . Delivery ops (Projects, Time, Support, Documents) arrive later as the{" "}
          <Link href="/productivity" className="underline">
            Productivity Suite
          </Link>
          .
        </MarketingLead>
        <MarketingCtaGroup
          primary={{ href: "/contact?intent=qa", label: "Talk to QA" }}
          secondary={{ href: "/pricing", label: "Platform plans" }}
        />
      </MarketingSection>
    </div>
  );
}
