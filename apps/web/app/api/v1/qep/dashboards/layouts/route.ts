export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleSaveLayout } from "@/lib/api/v1/handlers/qep-dashboards";

export const POST = withPlatformApiAuth(handleSaveLayout, {
  operation: "qep.dashboards.layouts.save",
});
