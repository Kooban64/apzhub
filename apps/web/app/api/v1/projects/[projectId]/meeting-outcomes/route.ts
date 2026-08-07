import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateMeetingOutcome,
  handleListMeetingOutcomes,
} from "@/lib/api/v1/handlers/projects-collaboration";

export const GET = withPlatformApiAuth(handleListMeetingOutcomes, {
  operation: "projects.meetingOutcomes.list",
});

export const POST = withPlatformApiAuth(handleCreateMeetingOutcome, {
  operation: "projects.meetingOutcomes.create",
});
