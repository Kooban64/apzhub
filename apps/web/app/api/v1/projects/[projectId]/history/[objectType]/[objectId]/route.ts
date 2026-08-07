import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleOperationalHistory } from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleOperationalHistory, {
  operation: "projects.ops.history.read",
});
