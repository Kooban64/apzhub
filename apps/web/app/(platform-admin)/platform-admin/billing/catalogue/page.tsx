import { PlatformAdminBillingChrome } from "@/components/platform-admin/platform-admin-billing-chrome";
import { BillingCataloguePanel } from "@/components/platform-admin/platform-admin-commerce-control";

export default function BillingCataloguePage() {
  return (
    <PlatformAdminBillingChrome>
      <BillingCataloguePanel />
    </PlatformAdminBillingChrome>
  );
}
