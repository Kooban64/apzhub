export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetQepSecurityAssurance } from "@/lib/api/v1/handlers/qep-security-assurance";

export const GET = withPlatformApiAuth(handleGetQepSecurityAssurance, {
  operation: "qep.security_assurance.get",
});
