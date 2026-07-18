import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import { getSharedAuthorizationService } from "@apzhub/platform-authorization";

export async function GET(): Promise<NextResponse> {
  await getValidatedSession(await headers());
  const permissions = getSharedAuthorizationService().listPermissions();

  return NextResponse.json({
    data: permissions,
    meta: { count: permissions.length },
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  await getValidatedSession(await headers());
  const body = (await request.json()) as {
    permissionKey?: string;
    description?: string;
  };

  if (!body.permissionKey) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "permissionKey is required." } },
      { status: 400 },
    );
  }

  const permission = getSharedAuthorizationService().registerPermission({
    permissionKey: body.permissionKey,
    description: body.description,
  });

  return NextResponse.json({ data: permission }, { status: 201 });
}
