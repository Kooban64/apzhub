import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateReviewSchedule,
  handleListReviewSchedules,
} from "@/lib/api/v1/handlers/projects-reporting";

export const GET = withPlatformApiAuth(handleListReviewSchedules, {
  operation: "projects.reviewSchedules.list",
});

export const POST = withPlatformApiAuth(handleCreateReviewSchedule, {
  operation: "projects.reviewSchedules.create",
});
