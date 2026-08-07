import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleArchiveProgramme,
  handleUpdateProgramme,
} from "@/lib/api/v1/handlers/projects-portfolio-admin";

export const PATCH = withPlatformApiAuth(handleUpdateProgramme, {
  operation: "projects.portfolio.programmes.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveProgramme, {
  operation: "projects.portfolio.programmes.archive",
});
