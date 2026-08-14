export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleDunningAdvance } from "@/lib/api/v1/handlers/billing";

export const POST = withPlatformApiAuth(handleDunningAdvance, {
  operation: "billing.dunning.advance",
});
