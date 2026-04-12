import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { adminSetUserPassword } from "@/lib/identity/admin-user-service";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { MIN_PASSWORD_LENGTH } from "@/lib/identity/password-policy";

const bodySchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: RouteContext) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  if (!gate.user) {
    return attach(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }
  const { id: userId } = await ctx.params;
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return attach(NextResponse.json({ error: "Invalid body." }, { status: 400 }));
  }
  try {
    await adminSetUserPassword(userId, body.password, { userId: gate.user.id, correlationId });
    return attach(NextResponse.json({ ok: true }));
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? Number((e as { status: number }).status) : 500;
    const message = e instanceof Error ? e.message : "Could not set password.";
    if (status >= 400 && status < 500) {
      return attach(NextResponse.json({ error: message }, { status }));
    }
    return attach(NextResponse.json({ error: message }, { status: 500 }));
  }
}
