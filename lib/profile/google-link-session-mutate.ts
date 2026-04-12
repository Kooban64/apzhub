import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getIdentitySource } from "@/lib/adapters/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { appendSessionCookie } from "@/lib/auth/session-issuer.server";
import { decodeSessionTransportForServer } from "@/lib/auth/session-transport.server";
import { sessionSnapshotSchema, type SessionSnapshot } from "@/lib/auth/session-types";

export async function mutateActiveSessionCookie(
  mutate: (snapshot: SessionSnapshot) => SessionSnapshot,
): Promise<NextResponse> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  const snapshot = decodeSessionTransportForServer(raw);
  if (!snapshot || snapshot.sessionStatus !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const next = sessionSnapshotSchema.parse(mutate(snapshot));
  const res = NextResponse.json({ ok: true as const });
  appendSessionCookie(res, next, {
    mode: getIdentitySource(),
    auditSessionIssued: false,
  });
  return res;
}
