import Link from "next/link";
import { notFound } from "next/navigation";

import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";
import { getPublicProduct } from "@/lib/marketing/product-catalogue";

function startHref(packageId?: string): string {
  return packageId
    ? `/build?package=${encodeURIComponent(packageId)}&plan=plan.business&seats=1`
    : "/marketplace";
}

function ApzprdDetail() {
  const modules = [
    { name: "Projects", detail: "Plan and execute work" },
    { name: "Support", detail: "Manage customer and internal support" },
    { name: "Time", detail: "Record and understand time" },
    { name: "Workflow", detail: "Automate operational processes" },
    { name: "Analytics", detail: "Understand performance" },
    { name: "Knowledge", detail: "Capture organisational knowledge" },
    { name: "Documents", detail: "Manage working documents" },
  ] as const;

  return (
    <MarketingSection data-testid="product-detail-apzprd">
      <MarketingEyebrow>APZPRD</MarketingEyebrow>
      <MarketingHeading>Productivity</MarketingHeading>
      <MarketingLead>Everything your team needs to get work done.</MarketingLead>
      <MarketingCtaGroup
        primary={{ href: startHref("pkg.apzprd.projects"), label: "Start with APZPRD" }}
        secondary={{ href: "/pricing", label: "View Pricing" }}
      />
      <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
        Modules can be provisioned independently. Organisation subscription does not
        automatically grant every user access — Tenant Admin assigns people and roles.
      </p>
      <ul className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {modules.map((m) => (
          <li
            key={m.name}
            className="flex flex-wrap items-baseline justify-between gap-2 py-3"
          >
            <span className="font-medium">{m.name}</span>
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {m.detail}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-12 border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-6">
        <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
          One Workbench
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted-foreground)]">
          <li>Search across your work.</li>
          <li>Act without changing applications.</li>
          <li>See what needs your attention.</li>
          <li>Access only the products assigned to you.</li>
        </ul>
      </div>
    </MarketingSection>
  );
}

function ApzqepDetail() {
  return (
    <MarketingSection data-testid="product-detail-apzqep">
      <MarketingEyebrow>APZQEP</MarketingEyebrow>
      <MarketingHeading>Quality Engineering</MarketingHeading>
      <MarketingLead>Quality connected to the software you ship.</MarketingLead>
      <MarketingCtaGroup
        primary={{ href: startHref("pkg.apzqep.starter"), label: "Start with APZQEP" }}
        secondary={{ href: "/pricing", label: "View Pricing" }}
      />

      <div className="mt-12 grid gap-10 border-t border-[var(--color-border)] pt-10 md:grid-cols-3">
        <div>
          <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
            Test
          </h2>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>Test library</li>
            <li>Plans</li>
            <li>Manual testing</li>
            <li>Automated testing</li>
            <li>Runs and results</li>
          </ul>
        </div>
        <div>
          <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
            Understand
          </h2>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>Defects</li>
            <li>Evidence</li>
            <li>Automation</li>
            <li>Release readiness</li>
          </ul>
        </div>
        <div>
          <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
            Connect to Source
          </h2>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>Repository context</li>
            <li>Branches and commits</li>
            <li>CI execution context</li>
            <li>Read-only source workspace</li>
            <li>Test ↔ source relationships</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-6">
        <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
          From Test to Code
        </h2>
        <ol className="mt-4 space-y-1 text-sm text-[var(--color-muted-foreground)]">
          <li>Test</li>
          <li>↓ Result</li>
          <li>↓ Evidence</li>
          <li>↓ Defect</li>
          <li>↓ Source</li>
          <li>↓ Release decision</li>
        </ol>
      </div>
    </MarketingSection>
  );
}

function ApzpenDetail() {
  return (
    <MarketingSection data-testid="product-detail-apzpen">
      <MarketingEyebrow>APZPEN</MarketingEyebrow>
      <MarketingHeading>Security Testing</MarketingHeading>
      <MarketingLead>
        Professional penetration testing from authorisation to closure.
      </MarketingLead>
      <MarketingCtaGroup
        primary={{ href: startHref("pkg.apzpen.starter"), label: "Start with APZPEN" }}
        secondary={{ href: "/pricing", label: "View Pricing" }}
      />

      <div className="mt-12 grid gap-10 border-t border-[var(--color-border)] pt-10 md:grid-cols-3">
        <div>
          <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
            Engage
          </h2>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>Engagements</li>
            <li>Scope</li>
            <li>Rules of Engagement</li>
            <li>Assets</li>
          </ul>
        </div>
        <div>
          <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
            Test
          </h2>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>Security activities</li>
            <li>Professional tools</li>
            <li>Source review</li>
            <li>Raw-result triage</li>
          </ul>
        </div>
        <div>
          <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
            Resolve
          </h2>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>Findings</li>
            <li>Evidence</li>
            <li>Remediation</li>
            <li>Retesting</li>
            <li>Reporting</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 border border-[var(--color-border)] bg-[var(--color-muted)]/20 p-6">
        <h2 className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted-foreground)] uppercase">
          Controlled by Design
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted-foreground)]">
          <li>Testing scope and authorisation remain part of the engagement.</li>
          <li>Tool execution respects scope and Rules of Engagement.</li>
        </ul>
      </div>
    </MarketingSection>
  );
}

function ModuleDetail({ productId }: { readonly productId: string }) {
  const product = getPublicProduct(productId);
  if (!product || product.kind !== "module") return null;

  const addHref = startHref(product.packageId);

  return (
    <MarketingSection data-testid={`product-detail-${product.id}`}>
      <MarketingEyebrow>Product</MarketingEyebrow>
      <MarketingHeading>{product.name}</MarketingHeading>
      <MarketingLead>{product.summary}</MarketingLead>
      <div className="mt-8 space-y-4 text-sm text-[var(--color-muted-foreground)]">
        <p>
          <strong className="text-[var(--color-foreground)]">Licensing.</strong>{" "}
          Organisation entitlement is separate from per-user grants. Assign products and
          roles after purchase.
        </p>
        <p>
          <strong className="text-[var(--color-foreground)]">Works with.</strong> Same
          identity, organisation, and administration across APZPRD, APZQEP, and APZPEN.
        </p>
      </div>
      <MarketingCtaGroup
        primary={{ href: addHref, label: "Get Started" }}
        secondary={{ href: "/products", label: "All products" }}
      />
      <p className="mt-6 text-sm">
        <Link href="/marketplace" className="underline">
          Browse packages
        </Link>
      </p>
    </MarketingSection>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly productId: string }>;
}) {
  const { productId } = await params;

  if (productId === "apzprd") return <ApzprdDetail />;
  if (productId === "apzqep" || productId === "qep") return <ApzqepDetail />;
  if (productId === "apzpen" || productId === "pen") return <ApzpenDetail />;

  const product = getPublicProduct(productId);
  if (!product) notFound();
  return <ModuleDetail productId={productId} />;
}
