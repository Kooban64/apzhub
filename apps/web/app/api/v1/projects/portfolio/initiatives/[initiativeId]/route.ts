import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleArchiveInitiative,
  handleUpdateInitiative,
} from "@/lib/api/v1/handlers/projects-portfolio-admin";

export const PATCH = withPlatformApiAuth(handleUpdateInitiative, {
  operation: "projects.portfolio.initiatives.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveInitiative, {
  operation: "projects.portfolio.initiatives.archive",
});
