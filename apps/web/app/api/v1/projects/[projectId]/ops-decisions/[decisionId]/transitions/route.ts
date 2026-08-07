import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleTransitionOpsDecision } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleTransitionOpsDecision, {
  operation: "projects.ops.decisions.transition",
});
