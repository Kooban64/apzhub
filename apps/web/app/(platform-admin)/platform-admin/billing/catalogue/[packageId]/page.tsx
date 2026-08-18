import { PlatformAdminBillingChrome } from "@/components/platform-admin/platform-admin-billing-chrome";
import { BillingCatalogueItemPanel } from "@/components/platform-admin/platform-admin-commerce-control";

export default async function BillingCatalogueItemPage({
  params,
}: {
  readonly params: Promise<{ readonly packageId: string }>;
}) {
  const { packageId } = await params;
  return (
    <PlatformAdminBillingChrome>
      <BillingCatalogueItemPanel packageId={decodeURIComponent(packageId)} />
    </PlatformAdminBillingChrome>
  );
}
