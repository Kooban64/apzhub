import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetReviewSnapshot } from "@/lib/api/v1/handlers/projects-reporting";

export const GET = withPlatformApiAuth(handleGetReviewSnapshot, {
  operation: "projects.reviews.snapshot",
});
