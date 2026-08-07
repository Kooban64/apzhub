import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handlePatchDependency } from "@/lib/api/v1/handlers/projects-operational";

export const PATCH = withPlatformApiAuth(handlePatchDependency, {
  operation: "projects.ops.dependencies.update",
});
