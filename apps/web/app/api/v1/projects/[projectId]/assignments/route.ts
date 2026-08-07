import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateAssignment,
  handleListAssignments,
} from "@/lib/api/v1/handlers/projects-resource";

export const GET = withPlatformApiAuth(handleListAssignments, {
  operation: "projects.assignments.list",
});

export const POST = withPlatformApiAuth(handleCreateAssignment, {
  operation: "projects.assignments.create",
});
