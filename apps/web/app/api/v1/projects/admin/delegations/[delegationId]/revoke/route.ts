import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleRevokeDelegation } from "@/lib/api/v1/handlers/projects-administration";

export const POST = withPlatformApiAuth(handleRevokeDelegation, {
  operation: "projects.admin.delegations.revoke",
});
