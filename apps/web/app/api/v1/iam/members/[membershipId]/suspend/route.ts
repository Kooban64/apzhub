export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleSuspendIamMember } from "@/lib/api/v1/handlers/iam-lifecycle";

export const POST = withPlatformApiAuth(handleSuspendIamMember, {
  operation: "iam.members.suspend",
});
