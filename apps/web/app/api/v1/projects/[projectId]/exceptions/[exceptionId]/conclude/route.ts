import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleConcludeException } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleConcludeException, {
  operation: "projects.ops.exceptions.conclude",
});
