import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleDeliveryConfidence } from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleDeliveryConfidence, {
  operation: "projects.ops.confidence.read",
});
