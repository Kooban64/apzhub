import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListContinuity,
  handleOpenContinuity,
} from "@/lib/api/v1/handlers/projects-resource";

export const GET = withPlatformApiAuth(handleListContinuity, {
  operation: "projects.continuity.list",
});

export const POST = withPlatformApiAuth(handleOpenContinuity, {
  operation: "projects.continuity.open",
});
