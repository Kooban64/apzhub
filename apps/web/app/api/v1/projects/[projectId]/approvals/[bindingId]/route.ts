import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetProjectApproval } from "@/lib/api/v1/handlers/projects-workflow-bridge";

export const GET = withPlatformApiAuth(handleGetProjectApproval, {
  operation: "projects.workflow.approvals.get",
});
