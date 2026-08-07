import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetTeamCapacity } from "@/lib/api/v1/handlers/projects-resource";

export const GET = withPlatformApiAuth(handleGetTeamCapacity, {
  operation: "projects.deliveryTeams.capacity",
});
