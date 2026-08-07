import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateDependency,
  handleListDependencies,
} from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleListDependencies, {
  operation: "projects.ops.dependencies.list",
});

export const POST = withPlatformApiAuth(handleCreateDependency, {
  operation: "projects.ops.dependencies.create",
});
