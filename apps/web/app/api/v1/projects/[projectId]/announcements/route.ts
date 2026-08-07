import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCreateAnnouncement } from "@/lib/api/v1/handlers/projects-collaboration";

export const POST = withPlatformApiAuth(handleCreateAnnouncement, {
  operation: "projects.announcements.create",
});
