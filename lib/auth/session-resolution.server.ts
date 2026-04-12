import "server-only";

import { decodeSessionTransportForServer } from "@/lib/auth/session-transport.server";
import { resolveSessionCookieWithDecode, type ResolvedSessionCookie } from "@/lib/auth/session-resolution";

export function resolveSessionCookieForServer(raw: string | undefined): ResolvedSessionCookie {
  return resolveSessionCookieWithDecode(raw, decodeSessionTransportForServer);
}
