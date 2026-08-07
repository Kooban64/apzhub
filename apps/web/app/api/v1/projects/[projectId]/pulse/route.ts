import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleProjectPulse } from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleProjectPulse, {
  operation: "projects.ops.pulse.read",
});
