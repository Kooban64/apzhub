import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handlePublishRetentionPolicy } from "@/lib/api/v1/handlers/projects-administration";

export const POST = withPlatformApiAuth(handlePublishRetentionPolicy, {
  operation: "projects.admin.retention.publish",
});
