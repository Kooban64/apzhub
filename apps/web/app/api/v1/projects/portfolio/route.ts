import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handlePortfolioProjection } from "@/lib/api/v1/handlers/projects-portfolio";

export const GET = withPlatformApiAuth(handlePortfolioProjection, {
  operation: "projects.portfolio.projection",
});
