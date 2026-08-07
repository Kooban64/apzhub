import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListBaselines,
  handleRebaseline,
} from "@/lib/api/v1/handlers/projects-lifecycle";

export const GET = withPlatformApiAuth(handleListBaselines, {
  operation: "projects.lifecycle.baselines.read",
});

export const POST = withPlatformApiAuth(handleRebaseline, {
  operation: "projects.lifecycle.rebaseline",
});
