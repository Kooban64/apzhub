import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetGovernanceCompliance } from "@/lib/api/v1/handlers/projects-governance";

export const GET = withPlatformApiAuth(handleGetGovernanceCompliance, {
  operation: "projects.governance.compliance",
});
