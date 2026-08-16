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

export default async function ProductDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly productId: string }>;
}) {
  const { productId } = await params;
  const product = getPublicProduct(productId);
  if (!product) notFound();

  const addHref = product.packageId
    ? `/build?package=${encodeURIComponent(product.packageId)}&plan=plan.business&seats=1`
    : "/marketplace";

  return (
    <MarketingSection>
      <MarketingEyebrow>Product</MarketingEyebrow>
      <MarketingHeading>{product.name}</MarketingHeading>
      <MarketingLead>{product.summary}</MarketingLead>
      <div className="mt-8 space-y-4 text-sm text-[var(--color-muted-foreground)]">
        <p>
          <strong className="text-[var(--color-foreground)]">What it does.</strong>{" "}
          Delivers governed capability for your organisation without exposing underlying
          provider tooling to end users.
        </p>
        <p>
          <strong className="text-[var(--color-foreground)]">Licensing.</strong>{" "}
          Organisation entitlement is separate from per-user grants. Assign products and
          roles after purchase.
        </p>
        <p>
          <strong className="text-[var(--color-foreground)]">Works with.</strong> Same
          identity, organisation, and administration across APZQEP, APZPEN, and APZPRD.
        </p>
      </div>
      <MarketingCtaGroup
        primary={{ href: addHref, label: "Add to package" }}
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
