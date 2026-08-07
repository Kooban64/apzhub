import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateOrgProfile,
  handleListOrgProfiles,
} from "@/lib/api/v1/handlers/projects-governance";

export const GET = withPlatformApiAuth(handleListOrgProfiles, {
  operation: "projects.governance.profiles.list",
});

export const POST = withPlatformApiAuth(handleCreateOrgProfile, {
  operation: "projects.governance.profiles.create",
});
