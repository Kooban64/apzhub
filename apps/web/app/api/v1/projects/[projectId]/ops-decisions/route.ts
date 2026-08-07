import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateOpsDecision,
  handleListOpsDecisions,
} from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleListOpsDecisions, {
  operation: "projects.ops.decisions.list",
});

export const POST = withPlatformApiAuth(handleCreateOpsDecision, {
  operation: "projects.ops.decisions.create",
});
