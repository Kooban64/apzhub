import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetProjectLifecycle,
  handlePatchProjectLifecycle,
} from "@/lib/api/v1/handlers/projects-lifecycle";

export const GET = withPlatformApiAuth(handleGetProjectLifecycle, {
  operation: "projects.lifecycle.read",
});

export const PATCH = withPlatformApiAuth(handlePatchProjectLifecycle, {
  operation: "projects.lifecycle.update",
});
