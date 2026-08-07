import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetTeamForecast } from "@/lib/api/v1/handlers/projects-resource";

export const GET = withPlatformApiAuth(handleGetTeamForecast, {
  operation: "projects.deliveryTeams.forecast",
});
