import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetHierarchyLayers } from "@/lib/api/v1/handlers/projects-administration";

export const GET = withPlatformApiAuth(handleGetHierarchyLayers, {
  operation: "projects.admin.hierarchy.get",
});
