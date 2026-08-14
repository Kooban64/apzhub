export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleActivateIamMember } from "@/lib/api/v1/handlers/iam-lifecycle";

export const POST = withPlatformApiAuth(handleActivateIamMember, {
  operation: "iam.members.activate",
});
