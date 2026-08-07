import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleArchiveObjective,
  handleUpdateObjective,
} from "@/lib/api/v1/handlers/projects-portfolio-admin";

export const PATCH = withPlatformApiAuth(handleUpdateObjective, {
  operation: "projects.portfolio.objectives.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveObjective, {
  operation: "projects.portfolio.objectives.archive",
});
