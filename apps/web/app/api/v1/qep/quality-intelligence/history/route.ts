export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListQiHistory } from "@/lib/api/v1/handlers/qep-quality-intelligence";

export const GET = withPlatformApiAuth(handleListQiHistory, {
  operation: "qep.qi.history.list",
});
