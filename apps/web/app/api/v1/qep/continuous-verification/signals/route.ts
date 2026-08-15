export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleContinuousVerificationMutation,
  handleListContinuousVerificationSignals,
} from "@/lib/api/v1/handlers/qep-continuous-verification";

export const GET = withPlatformApiAuth(handleListContinuousVerificationSignals, {
  operation: "qep.continuous_verification.list",
});

export const POST = withPlatformApiAuth(handleContinuousVerificationMutation, {
  operation: "qep.continuous_verification.mutate",
});
