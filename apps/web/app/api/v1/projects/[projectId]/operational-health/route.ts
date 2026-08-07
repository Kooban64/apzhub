import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleW004DeliveryHealth } from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleW004DeliveryHealth, {
  operation: "projects.ops.health.read",
});
