import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateCommitment,
  handleListCommitments,
} from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleListCommitments, {
  operation: "projects.ops.commitments.list",
});

export const POST = withPlatformApiAuth(handleCreateCommitment, {
  operation: "projects.ops.commitments.create",
});
