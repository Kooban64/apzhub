import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListReportCatalogue } from "@/lib/api/v1/handlers/projects-reporting";

export const GET = withPlatformApiAuth(handleListReportCatalogue, {
  operation: "projects.reports.catalogue",
});
