import Link from "next/link";

import {
  MarketingCtaGroup,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

const PILLARS = [
  {
    id: "productivity",
    label: "Productivity",
    code: "APZPRD",
    href: "/products/apzprd",
    items: [
      "Projects",
      "Support",
      "Time",
      "Workflow",
      "Analytics",
      "Knowledge",
      "Documents",
    ],
  },
  {
    id: "quality",
    label: "Quality",
    code: "APZQEP",
    href: "/products/apzqep",
    items: [
      "Quality engineering",
      "Test management",
      "Automation",
      "Evidence",
      "Release readiness",
      "Source context",
    ],
  },
  {
    id: "security",
    label: "Security",
    code: "APZPEN",
    href: "/products/apzpen",
    items: [
      "Penetration testing",
      "Engagements",
      "Findings",
      "Evidence",
      "Retesting",
      "Reporting",
    ],
  },
] as const;

export default function HubLandingPage() {
  return (
    <div data-testid="public-home">
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-8 sm:py-28">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
            One platform for better work.
          </h1>
          <p className="mt-5 text-sm font-medium tracking-[0.14em] text-[var(--color-muted-foreground)] uppercase">
            Productivity · Quality Engineering · Security Testing
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-muted-foreground)]">
            Run work. Test software. Secure what you build.
          </p>
          <div className="mt-10 flex justify-center">
            <MarketingCtaGroup
              primary={{ href: "/register", label: "Get Started" }}
              secondary={{ href: "/products", label: "Explore Products" }}
            />
          </div>
        </div>
      </section>

      <MarketingSection>
        <div className="grid gap-8 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
              data-testid={`home-pillar-${pillar.id}`}
            >
              <p className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
                {pillar.label}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                {pillar.code}
              </h2>
              <ul className="mt-5 space-y-1.5 text-sm text-[var(--color-muted-foreground)]">
                {pillar.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                href={pillar.href}
                className="mt-6 inline-block text-sm text-[var(--color-primary)] hover:underline"
              >
                Explore →
              </Link>
            </article>
          ))}
        </div>
      </MarketingSection>
    </div>
  );
}
