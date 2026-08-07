import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreatePolicy,
  handleListPolicies,
} from "@/lib/api/v1/handlers/projects-governance";

export const GET = withPlatformApiAuth(handleListPolicies, {
  operation: "projects.governance.policies.list",
});

export const POST = withPlatformApiAuth(handleCreatePolicy, {
  operation: "projects.governance.policies.create",
});
