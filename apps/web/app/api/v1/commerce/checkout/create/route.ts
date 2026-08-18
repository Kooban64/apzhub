export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCreateCommerceCheckout } from "@/lib/api/v1/handlers/commerce-checkout";

export const POST = withPlatformApiAuth(handleCreateCommerceCheckout, {
  operation: "commerce.checkout.create",
});
