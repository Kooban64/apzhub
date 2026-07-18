import type { PlatformProvisioningRuntime } from "./create-platform-provisioning";
import { evaluateCommercialReadiness } from "./commercial-readiness";
import type { StartProvisioningFlowInput } from "./types";

export type ProvisioningSessionUser = {
  readonly id: string;
};

export type ProvisioningSession = {
  readonly user: ProvisioningSessionUser;
  readonly tenantId?: string;
};

type SessionResolver = () => Promise<ProvisioningSession | null>;
type RuntimeResolver = () => Promise<PlatformProvisioningRuntime>;

function unauthorized(): Response {
  return Response.json(
    { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
    { status: 401 },
  );
}

export async function handlePostProvisioningFlow(
  resolveSession: SessionResolver,
  resolveRuntime: RuntimeResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = (await request.json()) as StartProvisioningFlowInput & {
    action?: "tenant_enablement" | "product_enablement" | "product_activation";
  };

  const tenantId = body.tenantId ?? session.tenantId;
  if (!tenantId) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "tenantId is required.",
        },
      },
      { status: 400 },
    );
  }

  const runtime = await resolveRuntime();
  const input: StartProvisioningFlowInput = {
    tenantId,
    productKeys: body.productKeys,
    correlationId: body.correlationId,
    actorId: session.user.id,
    async: body.async === true,
  };

  const action = body.action ?? "tenant_enablement";
  let flow;
  if (action === "product_enablement") {
    flow = await runtime.engine.startProductEnablement(input);
  } else if (action === "product_activation") {
    flow = await runtime.engine.startProductActivation(input);
  } else {
    flow = await runtime.engine.startTenantEnablement(input);
  }

  return Response.json({ data: flow }, { status: 201 });
}

export async function handleGetProvisioningFlows(
  resolveSession: SessionResolver,
  resolveRuntime: RuntimeResolver,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const runtime = await resolveRuntime();
  const flows = runtime.engine.listFlows(
    session.tenantId ? { tenantId: session.tenantId } : undefined,
  );
  return Response.json({
    data: { flows },
    meta: { count: flows.length },
  });
}

export async function handleGetProvisioningFlowStatus(
  resolveSession: SessionResolver,
  resolveRuntime: RuntimeResolver,
  flowId: string,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const runtime = await resolveRuntime();
  const flow = runtime.engine.getFlow(flowId);
  if (!flow) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Provisioning flow not found." } },
      { status: 404 },
    );
  }

  if (session.tenantId && flow.tenantId !== session.tenantId) {
    return Response.json(
      { error: { code: "FORBIDDEN", message: "Flow not in session tenant." } },
      { status: 403 },
    );
  }

  return Response.json({ data: flow });
}

export async function handleGetProvisioningHealth(
  resolveSession: SessionResolver,
  resolveRuntime: RuntimeResolver,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const runtime = await resolveRuntime();
  return Response.json({ data: runtime.health() });
}

export async function handleGetProvisioningDiagnostics(
  resolveSession: SessionResolver,
  resolveRuntime: RuntimeResolver,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const runtime = await resolveRuntime();
  return Response.json({ data: runtime.diagnostics() });
}

export async function handleGetCommercialReadiness(
  resolveSession: SessionResolver,
  resolveRuntime: RuntimeResolver,
  resolveGovernance: () => Promise<
    import("@apzhub/platform-governance").PlatformGovernanceService
  >,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "tenantId required on session for commercial readiness.",
        },
      },
      { status: 400 },
    );
  }

  await resolveRuntime();
  const governance = await resolveGovernance();
  const snapshot = await evaluateCommercialReadiness({
    tenantId,
    governance,
    hasAdmin: true,
  });

  return Response.json({ data: snapshot });
}
