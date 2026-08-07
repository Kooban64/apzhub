import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleControlSurface } from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleControlSurface, {
  operation: "projects.ops.control.read",
});
