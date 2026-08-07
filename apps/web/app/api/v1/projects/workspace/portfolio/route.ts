import { handleWorkspacePortfolio } from "@/lib/api/v1/handlers/projects-workspace";
import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";

export const GET = withPlatformApiAuth(handleWorkspacePortfolio, {
  operation: "projects.workspace.portfolio.read",
});
