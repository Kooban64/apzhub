export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleBillingRefund } from "@/lib/api/v1/handlers/billing";

export const POST = withPlatformApiAuth(handleBillingRefund, {
  operation: "billing.refund",
});
