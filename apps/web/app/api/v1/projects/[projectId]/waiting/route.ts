import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateWaiting,
  handleListWaiting,
} from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleListWaiting, {
  operation: "projects.ops.waiting.list",
});

export const POST = withPlatformApiAuth(handleCreateWaiting, {
  operation: "projects.ops.waiting.create",
});
