import { NextResponse } from "next/server";
import { z } from "zod";

import { getProvisioningSource } from "@/lib/adapters/env";
import { listProvisioningJobs } from "@/lib/adapters/provisioning/provisioning-adapter";
import { adminProvisioningJobTypeSchema } from "@/lib/admin/provisioning/job-contract";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import type { ProvisioningTriggerSource } from "@/lib/provisioning/contracts/enums";
import { isProvisioningTriggerSource } from "@/lib/provisioning/contracts/enums";
import { createProvisioningJob, isProvisioningEngineConfigured } from "@/lib/provisioning/service/provisioning-service";

const postBodySchema = z.object({
  userId: z.string().min(1),
  serviceId: z.string().min(1),
  jobType: adminProvisioningJobTypeSchema,
  triggerSource: z.custom<ProvisioningTriggerSource>(
    (v): v is ProvisioningTriggerSource => typeof v === "string" && isProvisioningTriggerSource(v),
  ),
  subjectLabel: z.string().min(1),
  desiredEffectiveRole: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  correlationId: z.string().optional(),
  requestedBy: z.string().optional(),
});

export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const jobs = await listProvisioningJobs();
  return attach(NextResponse.json({ jobs }));
}

export async function POST(request: Request) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  if (getProvisioningSource() !== "real") {
    return attach(NextResponse.json({ error: "Job enqueue requires APZHUB_PROVISIONING_SOURCE=real." }, { status: 400 }));
  }
  if (!isProvisioningEngineConfigured()) {
    return attach(NextResponse.json({ error: "Database not configured." }, { status: 503 }));
  }
  let body: z.infer<typeof postBodySchema>;
  try {
    body = postBodySchema.parse(await request.json());
  } catch {
    return attach(NextResponse.json({ error: "Invalid body." }, { status: 400 }));
  }
  const job = await createProvisioningJob({
    userId: body.userId,
    serviceId: body.serviceId,
    jobType: body.jobType,
    triggerSource: body.triggerSource,
    subjectLabel: body.subjectLabel,
    desiredEffectiveRole: body.desiredEffectiveRole,
    payload: body.payload,
    correlationId: body.correlationId ?? correlationId,
    requestedBy: body.requestedBy ?? undefined,
  });
  return attach(NextResponse.json({ job }));
}
