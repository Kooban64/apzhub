import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateOperationalRole,
  handleListOperationalRoles,
} from "@/lib/api/v1/handlers/projects-administration";

export const GET = withPlatformApiAuth(handleListOperationalRoles, {
  operation: "projects.admin.roles.list",
});

export const POST = withPlatformApiAuth(handleCreateOperationalRole, {
  operation: "projects.admin.roles.create",
});
