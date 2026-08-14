export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateQualityAssist,
  handleListQualityAssistSessions,
} from "@/lib/api/v1/handlers/qep-quality-assist";

export const GET = withPlatformApiAuth(handleListQualityAssistSessions, {
  operation: "qep.quality_assist.sessions.list",
});

export const POST = withPlatformApiAuth(handleCreateQualityAssist, {
  operation: "qep.quality_assist.sessions.create",
});
