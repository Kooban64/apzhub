import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetReview } from "@/lib/api/v1/handlers/projects-reporting";

export const GET = withPlatformApiAuth(handleGetReview, {
  operation: "projects.reviews.get",
});
