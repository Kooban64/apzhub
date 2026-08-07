import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetTeamHealth } from "@/lib/api/v1/handlers/projects-resource";

export const GET = withPlatformApiAuth(handleGetTeamHealth, {
  operation: "projects.deliveryTeams.health",
});
