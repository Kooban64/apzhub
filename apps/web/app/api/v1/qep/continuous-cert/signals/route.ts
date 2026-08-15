export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleContinuousCertMutation,
  handleListContinuousCertSignals,
} from "@/lib/api/v1/handlers/qep-continuous-cert";

export const GET = withPlatformApiAuth(handleListContinuousCertSignals, {
  operation: "qep.continuous_cert.list",
});

export const POST = withPlatformApiAuth(handleContinuousCertMutation, {
  operation: "qep.continuous_cert.mutate",
});
