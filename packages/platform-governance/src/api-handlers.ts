import type {
  FeatureFlagEvaluationContext,
  SetFeatureFlagOverrideInput,
  StartProvisioningInput,
  UpsertEnablementInput,
} from "./governance-types";
import { getGovernanceServiceForSession } from "./governance-runtime";

export interface GovernanceSessionUser {
  readonly id: string;
}

export interface GovernanceSession {
  readonly user: GovernanceSessionUser;
  readonly tenantId?: string;
}

type SessionResolver = () => Promise<GovernanceSession | null>;

function unauthorized(): Response {
  return Response.json(
    { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
    { status: 401 },
  );
}

export async function handleGetGovernance(
  resolveSession: SessionResolver,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const service = await getGovernanceServiceForSession();
  const enablements = await service.governance.listEnablements();
  const diagnostics = await service.getDiagnostics();

  return Response.json({
    data: {
      enablements,
      diagnostics,
      session: {
        userId: session.user.id,
        tenantId: session.tenantId ?? null,
      },
    },
  });
}

export async function handlePatchGovernance(
  resolveSession: SessionResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = (await request.json()) as UpsertEnablementInput;
  if (
    !body.scopeType ||
    !body.targetType ||
    !body.targetKey ||
    body.enabled === undefined
  ) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "scopeType, targetType, targetKey, and enabled are required.",
        },
      },
      { status: 400 },
    );
  }

  const service = await getGovernanceServiceForSession();
  const enablement = await service.governance.setEnablement(body);
  return Response.json({ data: enablement });
}

export async function handleGetProvisioning(
  resolveSession: SessionResolver,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const service = await getGovernanceServiceForSession();
  const history = await service.provisioning.listProvisioningHistory(
    session.tenantId ? { scopeType: "tenant", scopeKey: session.tenantId } : undefined,
  );
  const diagnostics = await service.getDiagnostics();

  return Response.json({
    data: {
      history,
      status: history.some((item) => item.status === "failed")
        ? "degraded"
        : history.length > 0
          ? "ready"
          : "pending",
      diagnostics,
    },
    meta: { count: history.length },
  });
}

export async function handlePostProvisioning(
  resolveSession: SessionResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = (await request.json()) as StartProvisioningInput & {
    action?: "tenant" | "product" | "module";
  };

  const service = await getGovernanceServiceForSession();
  let record;

  if (body.action === "tenant" && body.scopeKey) {
    const records = await service.provisioning.provisionTenant({
      tenantId: body.scopeKey,
      productKeys: body.targetKey ? [body.targetKey] : undefined,
    });
    return Response.json({ data: records }, { status: 201 });
  }

  if (!body.scopeType || !body.scopeKey || !body.targetType || !body.targetKey) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "scopeType, scopeKey, targetType, and targetKey are required.",
        },
      },
      { status: 400 },
    );
  }

  if (body.targetType === "product") {
    record = await service.productProvisioning.provisionProduct(body);
  } else if (body.targetType === "module") {
    record = await service.moduleProvisioning.provisionModule(body);
  } else {
    record = await service.provisioning.startProvisioning(body);
    record = await service.provisioning.completeProvisioning(record.provisioningId);
  }

  return Response.json({ data: record }, { status: 201 });
}

export async function handleGetFeatureFlags(
  resolveSession: SessionResolver,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const service = await getGovernanceServiceForSession();
  const flags = await service.featureFlags.listFlags();
  const overrides = await service.featureFlags.listOverrides();
  const context: FeatureFlagEvaluationContext = {
    userId: session.user.id,
    tenantId: session.tenantId,
  };
  const evaluated = await service.featureFlags.evaluateAll(context);

  return Response.json({
    data: { flags, overrides, evaluated },
    meta: { count: flags.length },
  });
}

export async function handlePatchFeatureFlag(
  resolveSession: SessionResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = (await request.json()) as SetFeatureFlagOverrideInput;
  if (!body.flagKey || !body.scopeType || body.enabled === undefined) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "flagKey, scopeType, and enabled are required.",
        },
      },
      { status: 400 },
    );
  }

  const service = await getGovernanceServiceForSession();
  const override = await service.featureFlags.setOverride(body);
  return Response.json({ data: override });
}

export async function handleGetCapabilities(
  resolveSession: SessionResolver,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const service = await getGovernanceServiceForSession();
  const diagnostics = await service.getCapabilityDiagnostics();
  return Response.json({
    data: diagnostics,
    meta: { count: diagnostics.capabilities.length },
  });
}

export async function handleGetGovernanceDiagnostics(
  resolveSession: SessionResolver,
): Promise<Response> {
  const session = await resolveSession();
  const { getSharedGovernanceService } = await import("./index");
  const inMemory = await getSharedGovernanceService().getDiagnostics();

  let postgres: Awaited<
    ReturnType<
      typeof import("./postgres-governance-store").getPostgresGovernanceDiagnostics
    >
  > | null = null;

  if (process.env.DATABASE_URL) {
    try {
      const { getPostgresGovernanceDiagnostics } =
        await import("./postgres-governance-store");
      postgres = await getPostgresGovernanceDiagnostics();
    } catch {
      postgres = null;
    }
  }

  const sessionService = session?.user?.id
    ? await getGovernanceServiceForSession()
    : null;
  const sessionGovernance = session?.user?.id
    ? await sessionService!.governance.resolveSessionSnapshot({
        userId: session.user.id,
        tenantId: session.tenantId,
      })
    : null;

  return Response.json({
    data: {
      diagnostics: { inMemory, postgres },
      session: session
        ? {
            userId: session.user.id,
            tenantId: session.tenantId ?? null,
            governance: sessionGovernance,
          }
        : null,
    },
  });
}
