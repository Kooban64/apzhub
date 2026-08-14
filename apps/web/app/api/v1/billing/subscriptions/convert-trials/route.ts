export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleConvertTrials } from "@/lib/api/v1/handlers/billing";

export const POST = withPlatformApiAuth(handleConvertTrials, {
  operation: "billing.subscriptions.convert_trials",
});
