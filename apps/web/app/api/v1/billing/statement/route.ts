export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleBillingStatement } from "@/lib/api/v1/handlers/billing";

export const GET = withPlatformApiAuth(handleBillingStatement, {
  operation: "billing.statement.get",
});
