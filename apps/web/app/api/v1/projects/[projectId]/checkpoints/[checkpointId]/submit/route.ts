import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleSubmitCheckpoint } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleSubmitCheckpoint, {
  operation: "projects.ops.checkpoints.submit",
});
