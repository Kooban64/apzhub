import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handlePublishPolicy } from "@/lib/api/v1/handlers/projects-governance";

export const POST = withPlatformApiAuth(handlePublishPolicy, {
  operation: "projects.governance.policies.publish",
});
