export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleBillingCredit } from "@/lib/api/v1/handlers/billing";

export const POST = withPlatformApiAuth(handleBillingCredit, {
  operation: "billing.credit",
});
