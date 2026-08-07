import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleStartReview } from "@/lib/api/v1/handlers/projects-reporting";

export const POST = withPlatformApiAuth(handleStartReview, {
  operation: "projects.reviews.start",
});
