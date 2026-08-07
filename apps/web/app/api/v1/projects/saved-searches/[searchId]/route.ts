import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleDeleteSavedSearch } from "@/lib/api/v1/handlers/projects-productivity";

export const DELETE = withPlatformApiAuth(handleDeleteSavedSearch, {
  operation: "projects.saved-searches.delete",
});
