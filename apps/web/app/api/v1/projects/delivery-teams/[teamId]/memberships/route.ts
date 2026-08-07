import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleAddDeliveryTeamMembership,
  handleListDeliveryTeamMemberships,
} from "@/lib/api/v1/handlers/projects-team-directory";

export const GET = withPlatformApiAuth(handleListDeliveryTeamMemberships, {
  operation: "projects.deliveryTeams.memberships.list",
});

export const POST = withPlatformApiAuth(handleAddDeliveryTeamMembership, {
  operation: "projects.deliveryTeams.memberships.create",
});
