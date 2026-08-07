import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAssignmentHistory } from "@/lib/api/v1/handlers/projects-resource";

export const GET = withPlatformApiAuth(handleAssignmentHistory, {
  operation: "projects.assignments.history",
});
