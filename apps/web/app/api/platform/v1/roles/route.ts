import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import { getSharedAuthorizationService } from "@apzhub/platform-authorization";

export async function GET(): Promise<NextResponse> {
  await getValidatedSession(await headers());
  const service = getSharedAuthorizationService();
  const roles = service.listRoles({ status: "active" });

  return NextResponse.json({
    data: roles,
    meta: { count: roles.length },
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  await getValidatedSession(await headers());
  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    scope?: "platform" | "tenant" | "product";
    tenantId?: string;
    productKey?: string;
    parentRoleId?: string;
    permissions?: readonly string[];
  };

  if (!body.slug || !body.name || !body.scope) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "slug, name, and scope are required." } },
      { status: 400 },
    );
  }

  const service = getSharedAuthorizationService();
  const role = service.createRole(
    {
      slug: body.slug,
      name: body.name,
      scope: body.scope,
      tenantId: body.tenantId,
      productKey: body.productKey,
      parentRoleId: body.parentRoleId,
    },
    body.permissions,
  );

  return NextResponse.json({ data: role }, { status: 201 });
}
