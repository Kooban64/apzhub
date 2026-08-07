import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCreateExternal } from "@/lib/api/v1/handlers/projects-resource";

export const POST = withPlatformApiAuth(handleCreateExternal, {
  operation: "projects.externals.create",
});
