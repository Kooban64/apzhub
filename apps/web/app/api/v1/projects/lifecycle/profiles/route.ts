import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListGovernanceProfiles } from "@/lib/api/v1/handlers/projects-lifecycle";

export const GET = withPlatformApiAuth(handleListGovernanceProfiles, {
  operation: "projects.lifecycle.profiles.read",
});
