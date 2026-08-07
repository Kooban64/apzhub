import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleLifecycleTransition,
  handleListLifecycleTransitions,
} from "@/lib/api/v1/handlers/projects-lifecycle";

export const GET = withPlatformApiAuth(handleListLifecycleTransitions, {
  operation: "projects.lifecycle.transitions.read",
});

export const POST = withPlatformApiAuth(handleLifecycleTransition, {
  operation: "projects.lifecycle.transition",
});
