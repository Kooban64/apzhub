import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleWaiveCheckpoint } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleWaiveCheckpoint, {
  operation: "projects.ops.checkpoints.waive",
});
