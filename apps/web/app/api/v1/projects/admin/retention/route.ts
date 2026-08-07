import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateRetentionPolicy,
  handleListRetentionPolicies,
} from "@/lib/api/v1/handlers/projects-administration";

export const GET = withPlatformApiAuth(handleListRetentionPolicies, {
  operation: "projects.admin.retention.list",
});

export const POST = withPlatformApiAuth(handleCreateRetentionPolicy, {
  operation: "projects.admin.retention.create",
});
