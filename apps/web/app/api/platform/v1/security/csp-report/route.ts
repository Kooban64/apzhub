import { handlePostCspReport } from "@apzhub/platform-security/server";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handlePostCspReport("web", request);
}
