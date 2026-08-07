import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateProductivitySession,
  handleListProductivitySessions,
} from "@/lib/api/v1/handlers/projects-productivity";

export const GET = withPlatformApiAuth(handleListProductivitySessions, {
  operation: "projects.productivity-sessions.list",
});

export const POST = withPlatformApiAuth(handleCreateProductivitySession, {
  operation: "projects.productivity-sessions.create",
});
