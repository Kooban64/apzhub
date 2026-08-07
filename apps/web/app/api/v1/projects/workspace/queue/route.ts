import { handleWorkspaceQueue } from "@/lib/api/v1/handlers/projects-workspace";
import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";

export const GET = withPlatformApiAuth(handleWorkspaceQueue, {
  operation: "projects.workspace.queue.read",
});
