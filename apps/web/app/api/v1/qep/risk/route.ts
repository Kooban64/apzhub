export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListRisks,
  handleRiskMutation,
} from "@/lib/api/v1/handlers/qep-risk-audit";

export const GET = withPlatformApiAuth(handleListRisks, {
  operation: "qep.risk.list",
});

export const POST = withPlatformApiAuth(handleRiskMutation, {
  operation: "qep.risk.mutate",
});
