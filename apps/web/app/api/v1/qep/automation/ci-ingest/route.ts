export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCiResultIngest } from "@/lib/api/v1/handlers/qep-automation";

export const POST = withPlatformApiAuth(handleCiResultIngest, {
  operation: "qep.automation.ci_ingest",
});
