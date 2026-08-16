export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleInspectIamMemberAccess } from "@/lib/api/v1/handlers/iam-lifecycle";

export const GET = withPlatformApiAuth(handleInspectIamMemberAccess, {
  operation: "iam.members.inspect-access",
});
