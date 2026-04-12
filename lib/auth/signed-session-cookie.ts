import { createHmac, timingSafeEqual } from "node:crypto";

import { sessionSnapshotSchema, type SessionSnapshot } from "@/lib/auth/session-types";

const PREFIX = "s2.";

function timingSafeEqualBase64Url(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "base64url");
    const bb = Buffer.from(b, "base64url");
    if (ab.length !== bb.length) {
      return false;
    }
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export function encodeSignedSessionCookie(snapshot: SessionSnapshot, secret: string): string {
  if (!secret || secret.length < 32) {
    throw new Error("Session signing secret must be at least 32 characters.");
  }
  const normalized = sessionSnapshotSchema.parse(snapshot);
  const payload = Buffer.from(JSON.stringify(normalized), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${PREFIX}${payload}.${sig}`;
}

export function decodeSignedSessionCookie(raw: string, secret: string | undefined): SessionSnapshot | null {
  if (!raw.startsWith(PREFIX) || !secret || secret.length < 32) {
    return null;
  }
  const rest = raw.slice(PREFIX.length);
  const lastDot = rest.lastIndexOf(".");
  if (lastDot <= 0) {
    return null;
  }
  const payload = rest.slice(0, lastDot);
  const sig = rest.slice(lastDot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (!timingSafeEqualBase64Url(sig, expected)) {
    return null;
  }
  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const parsed = sessionSnapshotSchema.safeParse(JSON.parse(json) as unknown);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
