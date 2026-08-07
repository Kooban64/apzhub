import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateObjective,
  handleListObjectives,
} from "@/lib/api/v1/handlers/projects-portfolio-admin";

export const GET = withPlatformApiAuth(handleListObjectives, {
  operation: "projects.portfolio.objectives.list",
});

export const POST = withPlatformApiAuth(handleCreateObjective, {
  operation: "projects.portfolio.objectives.create",
});
