import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateGovernedSearch,
  handleListGovernedSearches,
} from "@/lib/api/v1/handlers/projects-administration";

export const GET = withPlatformApiAuth(handleListGovernedSearches, {
  operation: "projects.admin.governed-searches.list",
});

export const POST = withPlatformApiAuth(handleCreateGovernedSearch, {
  operation: "projects.admin.governed-searches.create",
});
