export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { revokePlatformAdminSession } from "@/lib/platform-admin/build-platform-identity";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;

  let body: { userId?: string; sessionId?: string };
  try {
    body = (await request.json()) as { userId?: string; sessionId?: string };
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "Expected JSON body" } },
      { status: 400 },
    );
  }

  if (!body.userId?.trim() || !body.sessionId?.trim()) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "userId and sessionId are required",
        },
      },
      { status: 400 },
    );
  }

  try {
    const data = await revokePlatformAdminSession({
      userId: body.userId,
      sessionId: body.sessionId,
    });
    if (!data.revoked) {
      return NextResponse.json(
        {
          error: {
            code: "REVOKE_FAILED",
            message: "Session not found or could not be revoked",
          },
        },
        { status: 404 },
      );
    }
    return NextResponse.json({
      data,
      meta: { permission: PLATFORM_ADMIN_PERMISSION },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "REVOKE_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 500 },
    );
  }
}
