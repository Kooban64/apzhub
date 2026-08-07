import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetGovernanceAdminSummary } from "@/lib/api/v1/handlers/projects-governance";

export const GET = withPlatformApiAuth(handleGetGovernanceAdminSummary, {
  operation: "projects.governance.adminSummary",
});
