import Link from "next/link";

import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingMetric,
  MarketingPillarCard,
  MarketingProcessSteps,
  MarketingSection,
} from "@/components/marketing/marketing-ui";
import { PRODUCTIVITY_BUNDLE } from "@/lib/marketing/sites";

export default function HubLandingPage() {
  return (
    <div>
      <section className="relative min-h-[min(88vh,52rem)] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 75% 0%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 55%), linear-gradient(165deg, var(--color-background), color-mix(in srgb, var(--color-muted) 55%, var(--color-background)) 50%, var(--color-background))",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 65% 55% at 70% 35%, black 15%, transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto grid min-h-[min(88vh,52rem)] max-w-6xl items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <MarketingEyebrow>APZ platform</MarketingEyebrow>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--marketing-display,3.25rem)] leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem]">
              One platform for better software, stronger security and more productive
              teams.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[var(--color-muted-foreground)]">
              Quality engineering, security assurance and enterprise productivity —
              connected through one platform and available independently or together.
            </p>
            <MarketingCtaGroup
              primary={{ href: "/marketplace", label: "Explore Products" }}
              secondary={{ href: "/solutions", label: "View Solutions" }}
            />
          </div>
          <div className="grid gap-3" aria-label="Product areas">
            {[
              {
                href: "/solutions/quality",
                label: "Quality",
                title: "92% Release Ready",
                detail: "Release assurance across test evidence",
              },
              {
                href: "/solutions/security",
                label: "Security",
                title: "3 Risks Require Attention",
                detail: "Security findings awaiting remediation",
              },
              {
                href: "/solutions/productivity",
                label: "Productivity",
                title: "8 Items Need Attention",
                detail: "Projects · support · time · knowledge",
              },
            ].map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-5 backdrop-blur transition-colors hover:border-[var(--color-primary)]/60"
                style={{
                  transform: `translateY(${index * 4}px)`,
                }}
              >
                <p className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
                  {item.label}
                </p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {item.detail}
                </p>
                <p className="mt-3 text-sm text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">
                  Open →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-[var(--color-border)] bg-[var(--color-muted)]/20"
        aria-label="Platform trust"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 text-center text-xs font-medium tracking-[0.14em] text-[var(--color-muted-foreground)] uppercase sm:px-8">
          <span>Quality Engineering</span>
          <span>Security Assurance</span>
          <span>Productivity</span>
          <span>One Identity</span>
          <span>One Platform</span>
          <span>Modular Licensing</span>
        </div>
      </section>

      <MarketingSection>
        <MarketingEyebrow>What we do</MarketingEyebrow>
        <MarketingHeading>Quality. Security. Delivery.</MarketingHeading>
        <MarketingLead>
          Modern software demands more than a single test pass. We help organisations
          ensure applications perform as expected, remain resilient under pressure, and
          withstand real-world threats — then operate the workbench that keeps teams
          aligned.
        </MarketingLead>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/25 pt-16">
        <MarketingEyebrow>Service pillars</MarketingEyebrow>
        <MarketingHeading>Specialised expertise across the lifecycle</MarketingHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <MarketingPillarCard
            title="Quality Assurance"
            description="Ensure software meets business and user expectations."
            items={[
              "Functional testing",
              "Regression testing",
              "Mobile testing",
              "Performance testing",
              "User acceptance support",
            ]}
            href="/qa"
          />
          <MarketingPillarCard
            title="Test Automation"
            description="Accelerate releases through scalable automated testing."
            items={[
              "Automation frameworks",
              "CI/CD integration",
              "Automated regression",
              "API automation",
              "Continuous testing",
            ]}
            href="/qa#automation"
          />
          <MarketingPillarCard
            title="Security Testing"
            description="Identify vulnerabilities before attackers do."
            items={[
              "Web application pentesting",
              "API security testing",
              "Mobile pentesting",
              "Cloud assessments",
              "Red team exercises",
            ]}
            href="/pentest"
          />
          <MarketingPillarCard
            title={PRODUCTIVITY_BUNDLE.name}
            badge="Coming soon"
            description={PRODUCTIVITY_BUNDLE.description}
            items={PRODUCTIVITY_BUNDLE.products.map((p) => `${p.name} — ${p.summary}`)}
            href="/productivity"
          />
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)]">
        <MarketingEyebrow>Why organisations work with us</MarketingEyebrow>
        <MarketingHeading>Outcomes, not tool sprawl</MarketingHeading>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: "Reduce risk",
              d: "Find quality issues and security weaknesses before production.",
            },
            {
              t: "Accelerate delivery",
              d: "Improve release velocity through automation and streamlined testing.",
            },
            {
              t: "Improve customer trust",
              d: "Deliver reliable, secure applications users can depend on.",
            },
            {
              t: "Expert-led engagements",
              d: "Work with experienced QA engineers and security professionals.",
            },
          ].map((item) => (
            <li key={item.t}>
              <h3 className="font-medium">{item.t}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {item.d}
              </p>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <MarketingEyebrow>Our approach</MarketingEyebrow>
        <MarketingHeading>Continuous quality & security</MarketingHeading>
        <MarketingLead>
          We integrate quality and security throughout the software lifecycle rather
          than treating them as last-minute activities. Productivity tools join the same
          workbench when your organisation is ready.
        </MarketingLead>
        <MarketingProcessSteps
          steps={["Plan", "Build", "Test", "Secure", "Deploy", "Improve"]}
        />
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)]">
        <MarketingEyebrow>Industries</MarketingEyebrow>
        <MarketingHeading>Experience across multiple sectors</MarketingHeading>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--color-muted-foreground)]">
          {[
            "Financial Services",
            "Healthcare",
            "Insurance",
            "Telecommunications",
            "Retail",
            "Government",
            "SaaS & Technology",
            "Education",
          ].map((name) => (
            <span
              key={name}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="mt-6 text-sm">
          <Link
            href="/industries"
            className="text-[var(--color-primary)] hover:underline"
          >
            View industries →
          </Link>
        </p>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/30">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <MarketingMetric value="500+" label="Engagements" />
          <MarketingMetric value="99%" label="Client satisfaction focus" />
          <MarketingMetric value="QEP" label="Human GO / NO-GO quality gate" />
          <MarketingMetric value="4" label="Productivity tools in upcoming suite" />
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)]">
        <MarketingEyebrow>Featured engagements</MarketingEyebrow>
        <MarketingHeading>Proof over promises</MarketingHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "QA transformation",
              d: "Automated testing that reduced release times and improved stability.",
            },
            {
              t: "Application security assessment",
              d: "Pentesting that identified critical attack paths before launch.",
            },
            {
              t: "Continuous assurance",
              d: "Quality and security testing integrated into development pipelines.",
            },
          ].map((item) => (
            <article
              key={item.t}
              className="border-l-2 border-[var(--color-primary)] pl-4"
            >
              <h3 className="font-medium">{item.t}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {item.d}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm">
          <Link
            href="/case-studies"
            className="text-[var(--color-primary)] hover:underline"
          >
            View case studies →
          </Link>
        </p>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <MarketingEyebrow>Resources</MarketingEyebrow>
        <MarketingHeading>Insights & expertise</MarketingHeading>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          {[
            "Security research",
            "Testing best practices",
            "Automation guides",
            "Compliance resources",
            "Industry trends",
          ].map((label) => (
            <Link
              key={label}
              href="/resources"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)]">
        <MarketingHeading>Let&apos;s build software people can trust</MarketingHeading>
        <MarketingLead>
          Whether you&apos;re launching a product, scaling a platform, preparing for
          regulatory requirements, or planning the Productivity Suite (Projects, Time,
          Support, Documents), our specialists can help.
        </MarketingLead>
        <MarketingCtaGroup
          primary={{ href: "/contact", label: "Schedule consultation" }}
          secondary={{ href: "/pricing", label: "View platform pricing" }}
        />
      </MarketingSection>
    </div>
  );
}
