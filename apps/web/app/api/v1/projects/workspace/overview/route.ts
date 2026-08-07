import { handleWorkspaceOverview } from "@/lib/api/v1/handlers/projects-workspace";
import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";

export const GET = withPlatformApiAuth(handleWorkspaceOverview, {
  operation: "projects.workspace.overview.read",
});
