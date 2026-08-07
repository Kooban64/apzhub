import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleClosureReadiness } from "@/lib/api/v1/handlers/projects-lifecycle";

export const GET = withPlatformApiAuth(handleClosureReadiness, {
  operation: "projects.lifecycle.closure_readiness",
});
