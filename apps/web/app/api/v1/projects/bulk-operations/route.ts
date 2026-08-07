import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCreateBulkOperation } from "@/lib/api/v1/handlers/projects-productivity";

export const POST = withPlatformApiAuth(handleCreateBulkOperation, {
  operation: "projects.bulk-operations.create",
});
