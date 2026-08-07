import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleScanExceptions } from "@/lib/api/v1/handlers/projects-operational";

export const POST = withPlatformApiAuth(handleScanExceptions, {
  operation: "projects.ops.exceptions.scan",
});
