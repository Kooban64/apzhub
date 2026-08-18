import { PlatformAdminBillingChrome } from "@/components/platform-admin/platform-admin-billing-chrome";
import { BillingConfigurationPanel } from "@/components/platform-admin/platform-admin-commerce-control";

export default function BillingConfigurationPage() {
  return (
    <PlatformAdminBillingChrome>
      <BillingConfigurationPanel />
    </PlatformAdminBillingChrome>
  );
}
