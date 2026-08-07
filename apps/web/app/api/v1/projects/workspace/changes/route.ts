import { handleWorkspaceChanges } from "@/lib/api/v1/handlers/projects-workspace";
import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";

export const GET = withPlatformApiAuth(handleWorkspaceChanges, {
  operation: "projects.workspace.changes.read",
});
