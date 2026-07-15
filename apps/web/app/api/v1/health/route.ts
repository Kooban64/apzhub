export const runtime = "nodejs";

import { handlePlatformApiHealth } from "@/lib/api/v1/handlers/health";

export async function GET() {
  return handlePlatformApiHealth();
}
