import { sessionSnapshotSchema, type SessionSnapshot } from "@/lib/auth/session-types";

const PREFIX = "s2.";

function timingSafeEqualBase64Url(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "base64url");
    const bb = Buffer.from(b, "base64url");
    if (ab.length !== bb.length) {
      return false;
    }
    let diff = 0;
    for (let i = 0; i < ab.length; i++) {
      diff |= ab[i]! ^ bb[i]!;
    }
    return diff === 0;
  } catch {
    return false;
  }
}

async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Buffer.from(sig).toString("base64url");
}

/**
 * Verify `s2.` signed session cookies without `node:crypto` so this module is safe to import
 * from the Next `proxy` graph (Turbopack strips `decodeSignedSessionCookie` there).
 */
export async function decodeSignedSessionCookieWebCrypto(
  raw: string,
  secret: string | undefined,
): Promise<SessionSnapshot | null> {
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
  const expected = await hmacSha256Base64Url(secret, payload);
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
