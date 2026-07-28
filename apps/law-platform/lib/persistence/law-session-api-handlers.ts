/**
 * Platform API handlers for Law session SoR (APZHUB-ENG-0002 / R12-PERSIST-02).
 */

import { getDb } from "@apzhub/config/db";
import {
  loadPostgresActivitySessionSnapshot,
  savePostgresActivitySessionSnapshot,
} from "@apzhub/activity-timeline-framework/server";
import {
  loadPostgresNotificationSessionSnapshot,
  savePostgresNotificationSessionSnapshot,
} from "@apzhub/event-notification-framework/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function readScope(request: NextRequest): {
  tenantId: string;
  userId: string;
} {
  const { searchParams } = new URL(request.url);
  return {
    tenantId: searchParams.get("tenantId")?.trim() || "default-tenant",
    userId: searchParams.get("userId")?.trim() || "anonymous",
  };
}

function requireDatabase(): NextResponse | null {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Law session SoR requires DATABASE_URL",
        },
      },
      { status: 503 },
    );
  }
  return null;
}

export async function handleGetLawActivitySession(
  request: NextRequest,
): Promise<NextResponse> {
  const unavailable = requireDatabase();
  if (unavailable) return unavailable;
  const scope = readScope(request);
  const items = await loadPostgresActivitySessionSnapshot(getDb(), scope);
  return NextResponse.json({ ok: true, data: { items } });
}

export async function handlePutLawActivitySession(
  request: NextRequest,
): Promise<NextResponse> {
  const unavailable = requireDatabase();
  if (unavailable) return unavailable;
  const scope = readScope(request);
  const body = (await request.json()) as { items?: unknown };
  const items = Array.isArray(body.items) ? body.items : [];
  await savePostgresActivitySessionSnapshot(
    getDb(),
    scope,
    items as Parameters<typeof savePostgresActivitySessionSnapshot>[2],
  );
  return NextResponse.json({ ok: true, data: { items } });
}

export async function handleGetLawNotificationSession(
  request: NextRequest,
): Promise<NextResponse> {
  const unavailable = requireDatabase();
  if (unavailable) return unavailable;
  const scope = readScope(request);
  const items = await loadPostgresNotificationSessionSnapshot(getDb(), scope);
  return NextResponse.json({ ok: true, data: { items } });
}

export async function handlePutLawNotificationSession(
  request: NextRequest,
): Promise<NextResponse> {
  const unavailable = requireDatabase();
  if (unavailable) return unavailable;
  const scope = readScope(request);
  const body = (await request.json()) as { items?: unknown };
  const items = Array.isArray(body.items) ? body.items : [];
  await savePostgresNotificationSessionSnapshot(
    getDb(),
    scope,
    items as Parameters<typeof savePostgresNotificationSessionSnapshot>[2],
  );
  return NextResponse.json({ ok: true, data: { items } });
}
