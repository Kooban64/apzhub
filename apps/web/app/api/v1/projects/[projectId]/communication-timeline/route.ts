import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleUnifiedTimeline } from "@/lib/api/v1/handlers/projects-collaboration";

export const GET = withPlatformApiAuth(handleUnifiedTimeline, {
  operation: "projects.communicationTimeline.get",
});
