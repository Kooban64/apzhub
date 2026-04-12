import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { adminDeletePortalUser, adminUpdatePortalUser } from "@/lib/identity/admin-user-service";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

const patchBodySchema = z
  .object({
    displayName: z.string().min(1).max(200).optional(),
    platformRole: z.enum(["user", "admin", "superadmin"]).optional(),
  })
  .refine((o) => o.displayName !== undefined || o.platformRole !== undefined, {
    message: "At least one field required.",
  });

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: RouteContext) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  if (!gate.user) {
    return attach(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }
  const { id: userId } = await ctx.params;
  let body: z.infer<typeof patchBodySchema>;
  try {
    body = patchBodySchema.parse(await request.json());
  } catch {
    return attach(NextResponse.json({ error: "Invalid body." }, { status: 400 }));
  }
  try {
    await adminUpdatePortalUser(userId, body, {
      userId: gate.user.id,
      platformRole: gate.platformRole,
      correlationId,
    });
    return attach(NextResponse.json({ ok: true }));
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? Number((e as { status: number }).status) : 500;
    const message = e instanceof Error ? e.message : "Could not update user.";
    if (status >= 400 && status < 500) {
      return attach(NextResponse.json({ error: message }, { status }));
    }
    return attach(NextResponse.json({ error: message }, { status: 500 }));
  }
}

export async function DELETE(request: Request, ctx: RouteContext) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  if (!gate.user) {
    return attach(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }
  const { id: userId } = await ctx.params;
  try {
    await adminDeletePortalUser(userId, { userId: gate.user.id, correlationId });
    return attach(NextResponse.json({ ok: true }));
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? Number((e as { status: number }).status) : 500;
    const message = e instanceof Error ? e.message : "Could not delete user.";
    if (status >= 400 && status < 500) {
      return attach(NextResponse.json({ error: message }, { status }));
    }
    return attach(NextResponse.json({ error: message }, { status: 500 }));
  }
}
