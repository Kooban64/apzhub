import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleReassignAssignment } from "@/lib/api/v1/handlers/projects-resource";

export const POST = withPlatformApiAuth(handleReassignAssignment, {
  operation: "projects.assignments.reassign",
});
