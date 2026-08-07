import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListShortcuts } from "@/lib/api/v1/handlers/projects-productivity";

export const GET = withPlatformApiAuth(handleListShortcuts, {
  operation: "projects.productivity.shortcuts",
});
