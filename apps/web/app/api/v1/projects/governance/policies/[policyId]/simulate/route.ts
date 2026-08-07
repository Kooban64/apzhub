import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleSimulatePolicyPublish } from "@/lib/api/v1/handlers/projects-governance";

export const POST = withPlatformApiAuth(handleSimulatePolicyPublish, {
  operation: "projects.governance.policies.simulate",
});
