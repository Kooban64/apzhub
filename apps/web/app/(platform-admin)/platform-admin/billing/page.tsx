import { PlatformAdminBillingView } from "@/components/platform-admin/platform-admin-billing";
import { PlatformAdminBillingChrome } from "@/components/platform-admin/platform-admin-billing-chrome";
import { BillingReadinessPanel } from "@/components/platform-admin/platform-admin-commerce-control";

export default function PlatformAdminBillingPage() {
  return (
    <PlatformAdminBillingChrome>
      <BillingReadinessPanel />
      <PlatformAdminBillingView embedded />
    </PlatformAdminBillingChrome>
  );
}
