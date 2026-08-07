import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleApplyProjectApproval } from "@/lib/api/v1/handlers/projects-workflow-bridge";

export const POST = withPlatformApiAuth(handleApplyProjectApproval, {
  operation: "projects.workflow.approvals.apply",
});
