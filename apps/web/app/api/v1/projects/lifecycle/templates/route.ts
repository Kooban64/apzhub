import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListProjectTemplates } from "@/lib/api/v1/handlers/projects-lifecycle";

export const GET = withPlatformApiAuth(handleListProjectTemplates, {
  operation: "projects.lifecycle.templates.read",
});
