import { handleGetSystemLiveness } from "@apzhub/platform-security/server";

export async function GET(): Promise<Response> {
  return handleGetSystemLiveness();
}
