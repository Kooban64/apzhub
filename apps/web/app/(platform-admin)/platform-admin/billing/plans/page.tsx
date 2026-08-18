import { PlatformAdminBillingChrome } from "@/components/platform-admin/platform-admin-billing-chrome";
import { BillingPlansPanel } from "@/components/platform-admin/platform-admin-commerce-control";

export default function BillingPlansPage() {
  return (
    <PlatformAdminBillingChrome>
      <BillingPlansPanel />
    </PlatformAdminBillingChrome>
  );
}
