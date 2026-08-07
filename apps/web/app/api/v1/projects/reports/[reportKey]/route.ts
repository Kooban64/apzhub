import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleRunReport } from "@/lib/api/v1/handlers/projects-reporting";

export const GET = withPlatformApiAuth(handleRunReport, {
  operation: "projects.reports.run",
});
