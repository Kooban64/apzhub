export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleSetIamMemberProductGrants } from "@/lib/api/v1/handlers/iam-lifecycle";

export const POST = withPlatformApiAuth(handleSetIamMemberProductGrants, {
  operation: "iam.members.product_grants",
});
