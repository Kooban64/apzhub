import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListCrossProductTargets } from "@/lib/api/v1/handlers/projects-productivity";

export const GET = withPlatformApiAuth(handleListCrossProductTargets, {
  operation: "projects.productivity.cross-product",
});
