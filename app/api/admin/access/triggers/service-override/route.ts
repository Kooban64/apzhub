import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { isAccessCatalogSubject } from "@/lib/access/materialize-admin-access";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { triggerServiceOverrideChange } from "@/lib/provisioning/access-triggers";
import { provisioningTriggersUnavailableResponse } from "@/lib/provisioning/trigger-http-guard";

const bodySchema = z.object({
  userId: z.string().min(1),
  serviceId: z.string().min(1),
  /** Set to null to clear override (re-baseline from bundles). */
  effectiveRole: z.string().nullable(),
});

export async function POST(request: Request) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const prelude = provisioningTriggersUnavailableResponse();
  if (prelude) {
    return attach(prelude);
  }
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return attach(NextResponse.json({ error: "Invalid body." }, { status: 400 }));
  }
  if (!(await isAccessCatalogSubject(body.userId))) {
    return attach(NextResponse.json({ error: "Unknown user." }, { status: 404 }));
  }
  const result = await triggerServiceOverrideChange({
    userId: body.userId,
    serviceId: body.serviceId,
    effectiveRole: body.effectiveRole,
    correlationId,
  });
  return attach(NextResponse.json(result));
}
