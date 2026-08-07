import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handlePublishGovernedSearch } from "@/lib/api/v1/handlers/projects-administration";

export const POST = withPlatformApiAuth(handlePublishGovernedSearch, {
  operation: "projects.admin.governed-searches.publish",
});
