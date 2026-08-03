export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListWidgets } from "@/lib/api/v1/handlers/qep-dashboards";

export const GET = withPlatformApiAuth(handleListWidgets, {
  operation: "qep.dashboards.widgets.list",
});
