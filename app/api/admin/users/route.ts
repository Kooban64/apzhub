import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { adminCreatePortalUser, adminListUsers } from "@/lib/identity/admin-user-service";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { MIN_PASSWORD_LENGTH } from "@/lib/identity/password-policy";

const createBodySchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(200),
  password: z.string().min(MIN_PASSWORD_LENGTH),
  platformRole: z.enum(["user", "admin", "superadmin"]),
});

export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const users = await adminListUsers();
  return attach(NextResponse.json({ users }));
}

export async function POST(request: Request) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  if (!gate.user) {
    return attach(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }
  let body: z.infer<typeof createBodySchema>;
  try {
    body = createBodySchema.parse(await request.json());
  } catch {
    return attach(NextResponse.json({ error: "Invalid body." }, { status: 400 }));
  }
  try {
    const created = await adminCreatePortalUser(body, {
      userId: gate.user.id,
      platformRole: gate.platformRole,
      correlationId,
    });
    return attach(NextResponse.json(created, { status: 201 }));
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? Number((e as { status: number }).status) : 500;
    const message = e instanceof Error ? e.message : "Could not create user.";
    if (status >= 400 && status < 500) {
      return attach(NextResponse.json({ error: message }, { status }));
    }
    return attach(NextResponse.json({ error: message }, { status: 500 }));
  }
}
