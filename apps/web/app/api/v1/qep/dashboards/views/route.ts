export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListSavedViews,
  handleSaveView,
} from "@/lib/api/v1/handlers/qep-dashboards";

export const GET = withPlatformApiAuth(handleListSavedViews, {
  operation: "qep.dashboards.views.list",
});

export const POST = withPlatformApiAuth(handleSaveView, {
  operation: "qep.dashboards.views.save",
});
