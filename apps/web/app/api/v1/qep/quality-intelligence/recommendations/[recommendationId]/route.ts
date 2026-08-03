export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetQiRecommendation,
  handleQiRecommendationAction,
} from "@/lib/api/v1/handlers/qep-quality-intelligence";

export const GET = withPlatformApiAuth(handleGetQiRecommendation, {
  operation: "qep.qi.recommendations.get",
});

export const POST = withPlatformApiAuth(handleQiRecommendationAction, {
  operation: "qep.qi.recommendations.action",
});
