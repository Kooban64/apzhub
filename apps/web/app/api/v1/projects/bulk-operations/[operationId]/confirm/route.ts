import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleConfirmBulkOperation } from "@/lib/api/v1/handlers/projects-productivity";

export const POST = withPlatformApiAuth(handleConfirmBulkOperation, {
  operation: "projects.bulk-operations.confirm",
});
