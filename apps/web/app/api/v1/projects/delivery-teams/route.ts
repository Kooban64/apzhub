import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateDeliveryTeam,
  handleListDeliveryTeams,
} from "@/lib/api/v1/handlers/projects-team-directory";

export const GET = withPlatformApiAuth(handleListDeliveryTeams, {
  operation: "projects.deliveryTeams.list",
});

export const POST = withPlatformApiAuth(handleCreateDeliveryTeam, {
  operation: "projects.deliveryTeams.create",
});
