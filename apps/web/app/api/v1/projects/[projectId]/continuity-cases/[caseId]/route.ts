import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleUpdateContinuity } from "@/lib/api/v1/handlers/projects-resource";

export const PATCH = withPlatformApiAuth(handleUpdateContinuity, {
  operation: "projects.continuity.update",
});
