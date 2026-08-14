export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleStartTrial } from "@/lib/api/v1/handlers/billing";

export const POST = withPlatformApiAuth(handleStartTrial, {
  operation: "billing.subscriptions.start_trial",
});
