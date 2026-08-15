export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListQepAudit } from "@/lib/api/v1/handlers/qep-risk-audit";

export const GET = withPlatformApiAuth(handleListQepAudit, {
  operation: "qep.audit.list",
});
