import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleResolveWaiting } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleResolveWaiting, {
  operation: "projects.ops.waiting.resolve",
});
