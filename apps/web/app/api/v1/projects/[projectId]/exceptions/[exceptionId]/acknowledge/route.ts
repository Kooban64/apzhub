import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAcknowledgeException } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleAcknowledgeException, {
  operation: "projects.ops.exceptions.acknowledge",
});
