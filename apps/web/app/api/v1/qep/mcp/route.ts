export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListMcpCatalogue,
  handleMcpMutation,
} from "@/lib/api/v1/handlers/qep-mcp";

export const GET = withPlatformApiAuth(handleListMcpCatalogue, {
  operation: "qep.mcp.catalogue",
});

export const POST = withPlatformApiAuth(handleMcpMutation, {
  operation: "qep.mcp.mutate",
});
