import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleInitiateProject } from "@/lib/api/v1/handlers/projects-lifecycle";

export const POST = withPlatformApiAuth(handleInitiateProject, {
  operation: "projects.lifecycle.initiate",
});
