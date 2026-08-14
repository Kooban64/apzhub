export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAssignIamMemberPersona } from "@/lib/api/v1/handlers/iam-lifecycle";

export const POST = withPlatformApiAuth(handleAssignIamMemberPersona, {
  operation: "iam.members.assign-persona",
});
