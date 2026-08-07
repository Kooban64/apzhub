import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleUpsertResponsibility } from "@/lib/api/v1/handlers/projects-resource";

export const POST = withPlatformApiAuth(handleUpsertResponsibility, {
  operation: "projects.responsibilities.create",
});
