import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetDeliveryTeam,
  handleUpdateDeliveryTeam,
} from "@/lib/api/v1/handlers/projects-team-directory";

export const GET = withPlatformApiAuth(handleGetDeliveryTeam, {
  operation: "projects.deliveryTeams.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateDeliveryTeam, {
  operation: "projects.deliveryTeams.update",
});
