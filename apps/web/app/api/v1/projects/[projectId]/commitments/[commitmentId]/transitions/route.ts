import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleTransitionCommitment } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleTransitionCommitment, {
  operation: "projects.ops.commitments.transition",
});
