export const runtime = "nodejs";

import { handlePlatformApiReadiness } from "@/lib/api/v1/handlers/health";

export async function GET() {
  return handlePlatformApiReadiness();
}
