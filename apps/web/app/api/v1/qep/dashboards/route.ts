export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListDashboards } from "@/lib/api/v1/handlers/qep-dashboards";

export const GET = withPlatformApiAuth(handleListDashboards, {
  operation: "qep.dashboards.list",
});
