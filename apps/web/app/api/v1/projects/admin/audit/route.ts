import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListAdminAudit } from "@/lib/api/v1/handlers/projects-administration";

export const GET = withPlatformApiAuth(handleListAdminAudit, {
  operation: "projects.admin.audit.list",
});
