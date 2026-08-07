import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleSyncProjectApproval } from "@/lib/api/v1/handlers/projects-workflow-bridge";

export const POST = withPlatformApiAuth(handleSyncProjectApproval, {
  operation: "projects.workflow.approvals.sync",
});
