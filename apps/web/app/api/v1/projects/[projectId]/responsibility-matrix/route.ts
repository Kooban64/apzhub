import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetResponsibilityMatrix } from "@/lib/api/v1/handlers/projects-resource";

export const GET = withPlatformApiAuth(handleGetResponsibilityMatrix, {
  operation: "projects.responsibilityMatrix.get",
});
