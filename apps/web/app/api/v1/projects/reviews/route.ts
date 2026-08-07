import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateReview,
  handleListReviews,
} from "@/lib/api/v1/handlers/projects-reporting";

export const GET = withPlatformApiAuth(handleListReviews, {
  operation: "projects.reviews.list",
});

export const POST = withPlatformApiAuth(handleCreateReview, {
  operation: "projects.reviews.create",
});
