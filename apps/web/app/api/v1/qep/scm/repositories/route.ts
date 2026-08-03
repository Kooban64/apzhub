export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListScmRepositories,
  handleRegisterScmRepository,
} from "@/lib/api/v1/handlers/qep-scm";

export const GET = withPlatformApiAuth(handleListScmRepositories, {
  operation: "qep.scm.repositories.list",
});

export const POST = withPlatformApiAuth(handleRegisterScmRepository, {
  operation: "qep.scm.repositories.register",
});
