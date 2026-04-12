import { adminModeAllowed } from "@/lib/auth/mode-contract";
import type { SessionSnapshot } from "@/lib/auth/session-types";

export function isSessionExpired(snapshot: SessionSnapshot): boolean {
  if (snapshot.sessionStatus === "expired") {
    return true;
  }
  const exp = snapshot.expiresAtEpochSec;
  if (exp === undefined) {
    return false;
  }
  return exp * 1000 < Date.now();
}

export function canAccessPath(snapshot: SessionSnapshot, pathname: string): boolean {
  if (snapshot.sessionStatus === "anonymous" || isSessionExpired(snapshot)) {
    return false;
  }
  if (snapshot.sessionStatus !== "active") {
    return false;
  }
  if (pathname.startsWith("/admin")) {
    return adminModeAllowed(snapshot);
  }
  return true;
}
