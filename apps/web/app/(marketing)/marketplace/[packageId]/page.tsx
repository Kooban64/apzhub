import Link from "next/link";
import { notFound } from "next/navigation";

import { getPackage, getProduct } from "@/lib/commercial/catalogue";
import { buildPathWithCart } from "@/lib/commercial/commerce-cart";

type PageProps = {
  readonly params: Promise<{ packageId: string }>;
};

export default async function MarketplacePackageDetailPage({ params }: PageProps) {
  const { packageId: rawId } = await params;
  const packageId = decodeURIComponent(rawId);
  const pkg = getPackage(packageId);
  if (!pkg || !pkg.selfServe) {
    notFound();
  }

  const available = pkg.status === "available";
  const cart = {
    packageId: pkg.packageId,
    planId: "plan.business" as const,
    seats: 1,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <Link
        href="/marketplace"
        className="text-sm text-[var(--color-muted-foreground)] hover:underline"
      >
        ← Marketplace
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
        {pkg.name}
      </h1>
      <p className="mt-3 text-[var(--color-muted-foreground)]">{pkg.description}</p>
      <p className="mt-2 text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {pkg.status === "available" ? "Available" : "Coming soon"} · {pkg.suiteId}
      </p>

      <h2 className="mt-10 font-[family-name:var(--font-display)] text-xl font-semibold">
        Included products
      </h2>
      <ul className="mt-4 space-y-3">
        {pkg.productKeys.map((key) => {
          const product = getProduct(key);
          return (
            <li
              key={key}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            >
              <p className="font-medium">{product?.name ?? key}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {product?.description ?? ""}
              </p>
            </li>
          );
        })}
      </ul>

      {available ? (
        <Link
          href={buildPathWithCart("/build", cart)}
          className="mt-8 inline-block rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)]"
          data-testid="marketplace-continue-build"
        >
          Continue to configure
        </Link>
      ) : (
        <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
          This package is not self-serve yet.{" "}
          <Link href="/contact" className="underline">
            Contact us
          </Link>
          .
        </p>
      )}
    </div>
  );
}
