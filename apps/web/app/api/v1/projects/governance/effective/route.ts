import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetEffectiveGovernance } from "@/lib/api/v1/handlers/projects-governance";

export const GET = withPlatformApiAuth(handleGetEffectiveGovernance, {
  operation: "projects.governance.effective",
});
