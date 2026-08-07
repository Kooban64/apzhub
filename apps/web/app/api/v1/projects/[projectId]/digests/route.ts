import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleBuildDigest } from "@/lib/api/v1/handlers/projects-collaboration";

export const POST = withPlatformApiAuth(handleBuildDigest, {
  operation: "projects.digests.build",
});
