import { cookies } from "next/headers";

import { getIdentitySource } from "@/lib/adapters/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { resolveSessionCookieForServer } from "@/lib/auth/session-resolution.server";
import { anonymousSessionSnapshot, type SessionSnapshot } from "@/lib/auth/session-types";
import { validateAuthSession } from "@/lib/identity/local-auth-service";

export async function getSessionSnapshot(): Promise<SessionSnapshot> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  const { credential, decoded } = resolveSessionCookieForServer(raw);

  if (getIdentitySource() === "local") {
    if (credential !== "none" && (!decoded || !decoded.authSessionId)) {
      return anonymousSessionSnapshot();
    }
  }

  if (credential === "none" || credential === "invalid") {
    return anonymousSessionSnapshot();
  }
  if (credential === "expired" && decoded) {
    return { ...decoded, sessionStatus: "expired" };
  }
  if (credential === "active" && decoded) {
    if (getIdentitySource() === "local" && decoded.authSessionId) {
      const checked = await validateAuthSession(decoded);
      if (!checked) {
        return anonymousSessionSnapshot();
      }
      return checked;
    }
    return decoded;
  }
  return anonymousSessionSnapshot();
}
