import { PlatformAdminBillingChrome } from "@/components/platform-admin/platform-admin-billing-chrome";
import { BillingDiscountsPanel } from "@/components/platform-admin/platform-admin-commerce-control";

export default function BillingDiscountsPage() {
  return (
    <PlatformAdminBillingChrome>
      <BillingDiscountsPanel />
    </PlatformAdminBillingChrome>
  );
}
