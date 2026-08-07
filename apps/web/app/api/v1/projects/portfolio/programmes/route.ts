import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateProgramme,
  handleListProgrammes,
} from "@/lib/api/v1/handlers/projects-portfolio-admin";

export const GET = withPlatformApiAuth(handleListProgrammes, {
  operation: "projects.portfolio.programmes.list",
});

export const POST = withPlatformApiAuth(handleCreateProgramme, {
  operation: "projects.portfolio.programmes.create",
});
