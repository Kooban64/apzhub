import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListProjectApprovals,
  handleRequestProjectApproval,
} from "@/lib/api/v1/handlers/projects-workflow-bridge";

export const GET = withPlatformApiAuth(handleListProjectApprovals, {
  operation: "projects.workflow.approvals.list",
});

export const POST = withPlatformApiAuth(handleRequestProjectApproval, {
  operation: "projects.workflow.approvals.request",
});
