import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCreateNotice } from "@/lib/api/v1/handlers/projects-collaboration";

export const POST = withPlatformApiAuth(handleCreateNotice, {
  operation: "projects.notices.create",
});
