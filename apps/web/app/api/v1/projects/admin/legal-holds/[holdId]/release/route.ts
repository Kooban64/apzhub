import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleReleaseLegalHold } from "@/lib/api/v1/handlers/projects-administration";

export const POST = withPlatformApiAuth(handleReleaseLegalHold, {
  operation: "projects.admin.legal-holds.release",
});
