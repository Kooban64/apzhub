import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleInitiationReadiness } from "@/lib/api/v1/handlers/projects-lifecycle";

export const GET = withPlatformApiAuth(handleInitiationReadiness, {
  operation: "projects.lifecycle.initiation_readiness",
});
