export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleAutomationMappingsMutation,
  handleListAutomationMappings,
} from "@/lib/api/v1/handlers/qep-automation-mappings";

export const GET = withPlatformApiAuth(handleListAutomationMappings, {
  operation: "qep.automation.mappings.list",
});

export const POST = withPlatformApiAuth(handleAutomationMappingsMutation, {
  operation: "qep.automation.mappings.mutate",
});
