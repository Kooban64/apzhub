import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateException,
  handleListExceptions,
} from "@/lib/api/v1/handlers/projects-operational";

export const GET = withPlatformApiAuth(handleListExceptions, {
  operation: "projects.ops.exceptions.list",
});

export const POST = withPlatformApiAuth(handleCreateException, {
  operation: "projects.ops.exceptions.create",
});
