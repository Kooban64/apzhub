import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleUpdateAssignment } from "@/lib/api/v1/handlers/projects-resource";

export const PATCH = withPlatformApiAuth(handleUpdateAssignment, {
  operation: "projects.assignments.update",
});
