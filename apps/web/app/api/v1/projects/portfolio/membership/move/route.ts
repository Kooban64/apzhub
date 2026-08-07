import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleMoveProjectMembership } from "@/lib/api/v1/handlers/projects-portfolio-admin";

export const POST = withPlatformApiAuth(handleMoveProjectMembership, {
  operation: "projects.portfolio.membership.move",
});
