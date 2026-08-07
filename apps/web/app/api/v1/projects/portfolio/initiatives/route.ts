import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateInitiative,
  handleListInitiatives,
} from "@/lib/api/v1/handlers/projects-portfolio-admin";

export const GET = withPlatformApiAuth(handleListInitiatives, {
  operation: "projects.portfolio.initiatives.list",
});

export const POST = withPlatformApiAuth(handleCreateInitiative, {
  operation: "projects.portfolio.initiatives.create",
});
