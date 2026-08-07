import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListMessages,
  handlePostMessage,
} from "@/lib/api/v1/handlers/projects-collaboration";

export const GET = withPlatformApiAuth(handleListMessages, {
  operation: "projects.conversations.messages.list",
});

export const POST = withPlatformApiAuth(handlePostMessage, {
  operation: "projects.conversations.messages.create",
});
