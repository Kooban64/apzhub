import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetExecutiveSummary,
  handleUpdateExecutiveSummary,
} from "@/lib/api/v1/handlers/projects-reporting";

export const GET = withPlatformApiAuth(handleGetExecutiveSummary, {
  operation: "projects.reviews.executiveSummary.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateExecutiveSummary, {
  operation: "projects.reviews.executiveSummary.update",
});
