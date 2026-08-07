import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleSimulateProfilePublish } from "@/lib/api/v1/handlers/projects-governance";

export const POST = withPlatformApiAuth(handleSimulateProfilePublish, {
  operation: "projects.governance.profiles.simulate",
});
