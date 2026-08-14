export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCheckEntitlement,
  handleGetEntitlements,
} from "@/lib/api/v1/handlers/billing";

export const GET = withPlatformApiAuth(handleGetEntitlements, {
  operation: "billing.entitlements.get",
});

export const POST = withPlatformApiAuth(handleCheckEntitlement, {
  operation: "billing.entitlements.check",
});
