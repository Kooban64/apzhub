import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateDelegation,
  handleListDelegations,
} from "@/lib/api/v1/handlers/projects-administration";

export const GET = withPlatformApiAuth(handleListDelegations, {
  operation: "projects.admin.delegations.list",
});

export const POST = withPlatformApiAuth(handleCreateDelegation, {
  operation: "projects.admin.delegations.create",
});
