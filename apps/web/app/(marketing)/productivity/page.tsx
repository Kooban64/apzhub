import Link from "next/link";

import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";
import { PRODUCTIVITY_BUNDLE } from "@/lib/marketing/sites";

export default function ProductivityBundlePage() {
  return (
    <div>
      <MarketingSection className="pt-20">
        <span className="inline-block rounded border border-[var(--color-border)] px-2 py-0.5 text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
          Coming soon
        </span>
        <MarketingHeading as="h1">{PRODUCTIVITY_BUNDLE.name}</MarketingHeading>
        <MarketingLead>{PRODUCTIVITY_BUNDLE.description}</MarketingLead>
        <p className="mt-4 max-w-2xl text-sm text-[var(--color-muted-foreground)]">
          Sold as{" "}
          <strong className="font-medium text-[var(--color-foreground)]">
            one commercial bundle
          </strong>{" "}
          on APZHUB — not four separate brand sites. When marked available in the
          product catalogue, the workbench Activity Bar mutates to show entitled
          modules.
        </p>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/25">
        <MarketingEyebrow>Included products</MarketingEyebrow>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {PRODUCTIVITY_BUNDLE.products.map((product) => (
            <article
              key={product.key}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                {product.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {product.summary}
              </p>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-[var(--color-border)]">
        <MarketingHeading>How it fits APZHUB</MarketingHeading>
        <MarketingLead>
          Quality (APZQA / QEP) and Security (APZPenTest) are live engagement brands.
          Productivity joins the same platform login and entitlement model — org
          subscription ∩ user grants ∩ RBAC — when the suite ships.
        </MarketingLead>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
          <li>
            Live now:{" "}
            <Link href="/qa" className="underline">
              APZQA
            </Link>{" "}
            and{" "}
            <Link href="/pentest" className="underline">
              APZPenTest
            </Link>
          </li>
          <li>Later: Productivity Suite as a single plan / add-on bundle</li>
          <li>Platform Home, Admin, and Billing remain platform-scoped (not SKUs)</li>
        </ul>
        <MarketingCtaGroup
          primary={{
            href: "/contact?intent=productivity",
            label: "Join the waitlist",
          }}
          secondary={{ href: "/pricing", label: "Current pricing" }}
        />
      </MarketingSection>
    </div>
  );
}
