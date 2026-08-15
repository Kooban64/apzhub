export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleKnowledgeMutation,
  handleListKnowledge,
} from "@/lib/api/v1/handlers/qep-knowledge";

export const GET = withPlatformApiAuth(handleListKnowledge, {
  operation: "qep.knowledge.list",
});

export const POST = withPlatformApiAuth(handleKnowledgeMutation, {
  operation: "qep.knowledge.mutate",
});
