import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateStakeholder,
  handleListStakeholders,
} from "@/lib/api/v1/handlers/projects-resource";

export const GET = withPlatformApiAuth(handleListStakeholders, {
  operation: "projects.stakeholders.list",
});

export const POST = withPlatformApiAuth(handleCreateStakeholder, {
  operation: "projects.stakeholders.create",
});
