import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handlePublishProfile } from "@/lib/api/v1/handlers/projects-governance";

export const POST = withPlatformApiAuth(handlePublishProfile, {
  operation: "projects.governance.profiles.publish",
});
