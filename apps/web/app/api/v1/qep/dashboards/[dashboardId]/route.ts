export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetDashboard } from "@/lib/api/v1/handlers/qep-dashboards";

export const GET = withPlatformApiAuth(handleGetDashboard, {
  operation: "qep.dashboards.get",
});
