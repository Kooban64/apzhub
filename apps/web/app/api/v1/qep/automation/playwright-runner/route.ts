export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handlePlaywrightRunnerHealth } from "@/lib/api/v1/handlers/qep-automation";

export const GET = withPlatformApiAuth(handlePlaywrightRunnerHealth, {
  operation: "qep.automation.playwright_runner_health",
});
