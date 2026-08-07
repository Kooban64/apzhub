import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateCheckpoint,
  handleListCheckpoints,
} from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleListCheckpoints, {
  operation: "projects.ops.checkpoints.list",
});

export const POST = withPlatformApiAuth(handleCreateCheckpoint, {
  operation: "projects.ops.checkpoints.create",
});
