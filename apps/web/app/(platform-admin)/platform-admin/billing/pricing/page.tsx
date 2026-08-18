import { PlatformAdminBillingChrome } from "@/components/platform-admin/platform-admin-billing-chrome";
import { BillingPricingPanel } from "@/components/platform-admin/platform-admin-commerce-control";

export default function BillingPricingPage() {
  return (
    <PlatformAdminBillingChrome>
      <BillingPricingPanel />
    </PlatformAdminBillingChrome>
  );
}
