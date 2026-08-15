export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleMcpJsonRpc } from "@/lib/api/v1/handlers/qep-mcp-rpc";

export const POST = withPlatformApiAuth(handleMcpJsonRpc, {
  operation: "qep.mcp.rpc",
});
