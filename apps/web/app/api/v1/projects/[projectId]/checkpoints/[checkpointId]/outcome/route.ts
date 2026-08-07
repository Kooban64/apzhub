import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCheckpointOutcome } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleCheckpointOutcome, {
  operation: "projects.ops.checkpoints.outcome",
});
