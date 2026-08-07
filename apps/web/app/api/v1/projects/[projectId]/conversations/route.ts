import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateConversation,
  handleListConversations,
} from "@/lib/api/v1/handlers/projects-collaboration";

export const GET = withPlatformApiAuth(handleListConversations, {
  operation: "projects.conversations.list",
});

export const POST = withPlatformApiAuth(handleCreateConversation, {
  operation: "projects.conversations.create",
});
