export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListQiObservations,
  handleRecordQiObservation,
} from "@/lib/api/v1/handlers/qep-quality-intelligence";

export const GET = withPlatformApiAuth(handleListQiObservations, {
  operation: "qep.qi.observations.list",
});

export const POST = withPlatformApiAuth(handleRecordQiObservation, {
  operation: "qep.qi.observations.record",
});
