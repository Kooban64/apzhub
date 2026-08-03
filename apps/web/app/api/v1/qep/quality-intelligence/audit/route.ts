export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListQiAudits } from "@/lib/api/v1/handlers/qep-quality-intelligence";

export const GET = withPlatformApiAuth(handleListQiAudits, {
  operation: "qep.qi.audit.list",
});
