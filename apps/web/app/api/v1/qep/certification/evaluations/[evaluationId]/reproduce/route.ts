export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleReproduceCertificationEvaluation } from "@/lib/api/v1/handlers/qep-certification";

export const GET = withPlatformApiAuth(handleReproduceCertificationEvaluation, {
  operation: "qep.certification.reproduce",
});
