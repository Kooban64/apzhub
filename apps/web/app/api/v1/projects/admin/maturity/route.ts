import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAssessMaturity } from "@/lib/api/v1/handlers/projects-administration";

export const GET = withPlatformApiAuth(handleAssessMaturity, {
  operation: "projects.admin.maturity.assess",
});
