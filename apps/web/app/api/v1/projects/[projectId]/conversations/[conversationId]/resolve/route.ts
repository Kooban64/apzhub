import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleResolveConversation } from "@/lib/api/v1/handlers/projects-collaboration";

export const POST = withPlatformApiAuth(handleResolveConversation, {
  operation: "projects.conversations.resolve",
});
