import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateSavedSearch,
  handleListSavedSearches,
} from "@/lib/api/v1/handlers/projects-productivity";

export const GET = withPlatformApiAuth(handleListSavedSearches, {
  operation: "projects.saved-searches.list",
});

export const POST = withPlatformApiAuth(handleCreateSavedSearch, {
  operation: "projects.saved-searches.create",
});
