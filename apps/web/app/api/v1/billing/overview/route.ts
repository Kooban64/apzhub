export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetBillingOverview,
  handlePurchaseSku,
} from "@/lib/api/v1/handlers/billing";

export const GET = withPlatformApiAuth(handleGetBillingOverview, {
  operation: "billing.overview.get",
});

export const POST = withPlatformApiAuth(handlePurchaseSku, {
  operation: "billing.purchase",
});
