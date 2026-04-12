import { sessionSnapshotSchema, type SessionSnapshot } from "@/lib/auth/session-types";

export function encodeSessionCookie(snapshot: SessionSnapshot): string {
  const json = JSON.stringify(sessionSnapshotSchema.parse(snapshot));
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeSessionCookie(raw: string | undefined | null): SessionSnapshot | null {
  if (!raw) {
    return null;
  }
  try {
    const json = decodeURIComponent(escape(atob(raw)));
    const parsed = sessionSnapshotSchema.safeParse(JSON.parse(json) as unknown);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
