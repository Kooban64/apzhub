import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleContextualSearch } from "@/lib/api/v1/handlers/projects-collaboration";

export const GET = withPlatformApiAuth(handleContextualSearch, {
  operation: "projects.contextualSearch",
});
