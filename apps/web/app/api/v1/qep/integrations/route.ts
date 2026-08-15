export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleIntegrationsMutation,
  handleListIntegrations,
} from "@/lib/api/v1/handlers/qep-integrations";

export const GET = withPlatformApiAuth(handleListIntegrations, {
  operation: "qep.integrations.list",
});

export const POST = withPlatformApiAuth(handleIntegrationsMutation, {
  operation: "qep.integrations.mutate",
});
