import { PlatformAdminBillingChrome } from "@/components/platform-admin/platform-admin-billing-chrome";
import { BillingTaxPanel } from "@/components/platform-admin/platform-admin-commerce-control";

export default function BillingTaxPage() {
  return (
    <PlatformAdminBillingChrome>
      <BillingTaxPanel />
    </PlatformAdminBillingChrome>
  );
}
