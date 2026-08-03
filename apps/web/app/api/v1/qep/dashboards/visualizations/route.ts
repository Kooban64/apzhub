export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListVisualizationKinds } from "@/lib/api/v1/handlers/qep-dashboards";

export const GET = withPlatformApiAuth(handleListVisualizationKinds, {
  operation: "qep.dashboards.visualizations.list",
});
