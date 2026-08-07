import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleResumeProductivitySession } from "@/lib/api/v1/handlers/projects-productivity";

export const POST = withPlatformApiAuth(handleResumeProductivitySession, {
  operation: "projects.productivity-sessions.resume",
});
