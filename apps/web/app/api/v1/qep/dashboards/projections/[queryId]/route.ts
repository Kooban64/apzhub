export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetProjection } from "@/lib/api/v1/handlers/qep-dashboards";

export const GET = withPlatformApiAuth(handleGetProjection, {
  operation: "qep.dashboards.projections.get",
});
