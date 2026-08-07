import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListLegalHolds,
  handlePlaceLegalHold,
} from "@/lib/api/v1/handlers/projects-administration";

export const GET = withPlatformApiAuth(handleListLegalHolds, {
  operation: "projects.admin.legal-holds.list",
});

export const POST = withPlatformApiAuth(handlePlaceLegalHold, {
  operation: "projects.admin.legal-holds.place",
});
