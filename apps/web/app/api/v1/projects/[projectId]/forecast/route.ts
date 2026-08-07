import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleDeliveryForecast } from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleDeliveryForecast, {
  operation: "projects.ops.forecast.read",
});
