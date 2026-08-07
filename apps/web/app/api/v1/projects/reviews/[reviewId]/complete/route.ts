import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCompleteReview } from "@/lib/api/v1/handlers/projects-reporting";

export const POST = withPlatformApiAuth(handleCompleteReview, {
  operation: "projects.reviews.complete",
});
