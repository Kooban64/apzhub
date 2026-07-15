import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import { getSharedAuthorizationService } from "@apzhub/platform-authorization";

export async function GET(request: Request): Promise<NextResponse> {
  await getValidatedSession(await headers());
  const userId = new URL(request.url).searchParams.get("userId") ?? undefined;
  const service = getSharedAuthorizationService();

  if (!userId) {
    return NextResponse.json({
      data: [],
      meta: { message: "Provide userId query parameter to list assignments." },
    });
  }

  return NextResponse.json({
    data: service.listAssignmentsForUser(userId),
    meta: { userId },
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getValidatedSession(await headers());
  const body = (await request.json()) as {
    userId?: string;
    roleId?: string;
    tenantId?: string;
    productKey?: string;
  };

  if (!body.userId || !body.roleId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "userId and roleId are required." } },
      { status: 400 },
    );
  }

  const service = getSharedAuthorizationService();
  const assignment = service.assignRole({
    userId: body.userId,
    roleId: body.roleId,
    tenantId: body.tenantId ?? session?.tenantId,
    productKey: body.productKey,
  });

  return NextResponse.json({ data: assignment }, { status: 201 });
}

export async function DELETE(request: Request): Promise<NextResponse> {
  await getValidatedSession(await headers());
  const assignmentId = new URL(request.url).searchParams.get("assignmentId");

  if (!assignmentId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "assignmentId query parameter is required." } },
      { status: 400 },
    );
  }

  const removed = getSharedAuthorizationService().removeAssignment(assignmentId);
  if (!removed) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Assignment not found." } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: removed });
}
