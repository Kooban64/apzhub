import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { getApplicationService } from "@/lib/qep/application-runtime";
import { getDefectRuntime } from "@/lib/qep/defect-runtime";
import { getExperienceService } from "@/lib/qep/experience-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";
import { assertQepHttpEnabled } from "./qep";

type RouteContext = { params: Promise<Record<string, string>> };

function actorId(context: PlatformApiRequestContext): string {
  return context.serviceContext.userId;
}

function actorName(_context: PlatformApiRequestContext): string | undefined {
  return undefined;
}

function requireParam(
  params: Record<string, string> | undefined,
  name: string,
): string {
  const value = params?.[name]?.trim();
  if (!value) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `${name} is required`,
    });
  }
  return value;
}

function mapError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
}

async function requireApplication(
  tenantId: string,
  applicationId: string,
): Promise<string> {
  const id = applicationId.trim();
  if (!id) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
  try {
    const app = await getApplicationService().get(tenantId, id);
    return app.id;
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
}

async function environmentName(
  tenantId: string,
  applicationId: string,
  environmentId: string | undefined,
): Promise<string | undefined> {
  if (!environmentId) return undefined;
  try {
    const env = await getApplicationService().getEnvironment(
      tenantId,
      applicationId,
      environmentId,
    );
    return env.name;
  } catch {
    return undefined;
  }
}

function collection<T>(context: PlatformApiRequestContext, items: readonly T[]) {
  return jsonCollectionResponse(
    items,
    { cursor: null, nextCursor: null, limit: items.length, hasMore: false },
    context.tracing,
  );
}

function data<T>(context: PlatformApiRequestContext, value: T) {
  return jsonDataResponse(value, context.tracing);
}

async function readJson(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "invalid_json",
    });
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

export async function handleListExploratorySessions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.exploratory.read");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const applicationId = request.nextUrl.searchParams.get("applicationId")?.trim();
  if (!applicationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "applicationId is required",
    });
  }
  await requireApplication(tenantId, applicationId);
  try {
    return collection(
      context,
      await getExperienceService().listSessions(tenantId, applicationId),
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateExploratorySession(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.exploratory.manage");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const applicationId = await requireApplication(
    tenantId,
    String(body.applicationId ?? "").trim(),
  );
  const environmentId = String(body.environmentId ?? "").trim() || undefined;
  try {
    const item = await getExperienceService().createSession({
      tenantId,
      applicationId,
      actorId: actorId(context),
      name: String(body.name ?? ""),
      mission: String(body.mission ?? ""),
      scope: String(body.scope ?? ""),
      testerId: actorId(context),
      testerName: actorName(context),
      ...(environmentId ? { environmentId } : {}),
      ...((await environmentName(tenantId, applicationId, environmentId))
        ? {
            environmentName: await environmentName(
              tenantId,
              applicationId,
              environmentId,
            ),
          }
        : {}),
      areas: stringList(body.areas),
      sessionNotes: body.sessionNotes ? String(body.sessionNotes) : undefined,
    });
    return data(context, { session: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetExploratorySession(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.exploratory.read");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  try {
    return data(context, {
      session: await getExperienceService().getSession(
        tenantId,
        requireParam(params, "sessionId"),
      ),
    });
  } catch (error) {
    mapError(error);
  }
}

export async function handlePatchExploratorySession(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.exploratory.manage", "qep.exploratory.perform");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  const body = await readJson(request);
  try {
    const session = await getExperienceService().updateCharter({
      tenantId,
      sessionId: requireParam(params, "sessionId"),
      actorId: actorId(context),
      name: body.name ? String(body.name) : undefined,
      mission: body.mission ? String(body.mission) : undefined,
      scope: body.scope ? String(body.scope) : undefined,
      sessionNotes:
        body.sessionNotes !== undefined ? String(body.sessionNotes) : undefined,
      areas: Array.isArray(body.areas) ? stringList(body.areas) : undefined,
    });
    return data(context, { session });
  } catch (error) {
    mapError(error);
  }
}

export async function handleExploratorySessionAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.exploratory.perform", "qep.exploratory.manage");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  const body = await readJson(request);
  const action = String(body.action ?? "");
  const sessionId = requireParam(params, "sessionId");
  try {
    if (action === "add_area") {
      return data(context, {
        session: await getExperienceService().addArea({
          tenantId,
          sessionId,
          actorId: actorId(context),
          prompt: String(body.prompt ?? ""),
        }),
      });
    }
    if (action === "explore_area") {
      return data(context, {
        session: await getExperienceService().markAreaExplored({
          tenantId,
          sessionId,
          areaId: String(body.areaId ?? ""),
          actorId: actorId(context),
        }),
      });
    }
    if (
      action === "start" ||
      action === "pause" ||
      action === "resume" ||
      action === "complete" ||
      action === "block"
    ) {
      return data(context, {
        session: await getExperienceService().transitionSession({
          tenantId,
          sessionId,
          actorId: actorId(context),
          action,
        }),
      });
    }
    throw new Error("exploratory_session.action_invalid");
  } catch (error) {
    mapError(error);
  }
}

export async function handleListExperiencePlans(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.experience.read");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const applicationId = request.nextUrl.searchParams.get("applicationId")?.trim();
  if (!applicationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "applicationId is required",
    });
  }
  await requireApplication(tenantId, applicationId);
  try {
    return collection(
      context,
      await getExperienceService().listPlans(tenantId, applicationId),
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateExperiencePlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.experience.manage");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const applicationId = await requireApplication(
    tenantId,
    String(body.applicationId ?? "").trim(),
  );
  const environmentId = String(body.environmentId ?? "").trim() || undefined;
  try {
    const item = await getExperienceService().createPlan({
      tenantId,
      applicationId,
      actorId: actorId(context),
      name: String(body.name ?? ""),
      mission: String(body.mission ?? ""),
      scope: String(body.scope ?? ""),
      ownerId: actorId(context),
      ownerName: actorName(context),
      ...(environmentId ? { environmentId } : {}),
      ...((await environmentName(tenantId, applicationId, environmentId))
        ? {
            environmentName: await environmentName(
              tenantId,
              applicationId,
              environmentId,
            ),
          }
        : {}),
      disciplines: stringList(body.disciplines),
    });
    return data(context, { plan: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetExperiencePlan(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.experience.read");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  try {
    return data(context, {
      plan: await getExperienceService().getPlan(
        tenantId,
        requireParam(params, "planId"),
      ),
    });
  } catch (error) {
    mapError(error);
  }
}

export async function handleExperiencePlanAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.experience.manage", "qep.experience.perform");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  const planId = requireParam(params, "planId");
  const body = await readJson(request);
  const action = String(body.action ?? "");
  try {
    if (action === "add_context") {
      const contextBody = (body.context ?? body) as Record<string, unknown>;
      return data(context, {
        plan: await getExperienceService().addContext({
          tenantId,
          planId,
          actorId: actorId(context),
          context: {
            label: String(contextBody.label ?? ""),
            deviceClass: String(contextBody.deviceClass ?? ""),
            viewportWidth: contextBody.viewportWidth
              ? Number(contextBody.viewportWidth)
              : undefined,
            viewportHeight: contextBody.viewportHeight
              ? Number(contextBody.viewportHeight)
              : undefined,
            orientation: contextBody.orientation
              ? String(contextBody.orientation)
              : undefined,
            browser: contextBody.browser ? String(contextBody.browser) : undefined,
            browserVersion: contextBody.browserVersion
              ? String(contextBody.browserVersion)
              : undefined,
            operatingSystem: contextBody.operatingSystem
              ? String(contextBody.operatingSystem)
              : undefined,
            deviceProfile: contextBody.deviceProfile
              ? String(contextBody.deviceProfile)
              : undefined,
          },
        }),
      });
    }
    if (action === "add_criterion") {
      return data(context, {
        plan: await getExperienceService().addCriterion({
          tenantId,
          planId,
          actorId: actorId(context),
          criterion: {
            discipline: String(body.discipline ?? ""),
            statement: String(body.statement ?? ""),
          },
        }),
      });
    }
    if (action === "set_disciplines") {
      return data(context, {
        plan: await getExperienceService().setDisciplines({
          tenantId,
          planId,
          actorId: actorId(context),
          disciplines: stringList(body.disciplines),
        }),
      });
    }
    if (action === "start") {
      return data(context, {
        activity: await getExperienceService().startActivity({
          tenantId,
          planId,
          actorId: actorId(context),
          testerName: actorName(context),
        }),
      });
    }
    throw new Error("experience_plan.action_invalid");
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetExperienceActivity(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.experience.read");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  try {
    return data(context, {
      activity: await getExperienceService().getActivity(
        tenantId,
        requireParam(params, "activityId"),
      ),
    });
  } catch (error) {
    mapError(error);
  }
}

export async function handleExperienceActivityAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.experience.perform", "qep.experience.manage");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  const activityId = requireParam(params, "activityId");
  const body = await readJson(request);
  const action = String(body.action ?? "");
  try {
    if (action === "activate_context") {
      return data(context, {
        activity: await getExperienceService().activateContext({
          tenantId,
          activityId,
          contextId: String(body.contextId ?? ""),
          actorId: actorId(context),
        }),
      });
    }
    if (action === "complete_context") {
      return data(context, {
        activity: await getExperienceService().completeContext({
          tenantId,
          activityId,
          contextId: String(body.contextId ?? ""),
          actorId: actorId(context),
        }),
      });
    }
    if (action === "record_result") {
      return data(context, {
        activity: await getExperienceService().recordCriterionResult({
          tenantId,
          activityId,
          criterionId: String(body.criterionId ?? ""),
          contextId: String(body.contextId ?? ""),
          actorId: actorId(context),
          state: String(body.state ?? ""),
          concernFound: body.concernFound === true,
          note: body.note ? String(body.note) : undefined,
        }),
      });
    }
    if (
      action === "pause" ||
      action === "resume" ||
      action === "complete" ||
      action === "block"
    ) {
      return data(context, {
        activity: await getExperienceService().transitionActivity({
          tenantId,
          activityId,
          actorId: actorId(context),
          action,
        }),
      });
    }
    throw new Error("experience_activity.action_invalid");
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateQualityCapture(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const hostKind = String(body.hostKind ?? "");
  const perform =
    hostKind === "exploratory_session"
      ? (["qep.exploratory.perform", "qep.exploratory.manage"] as const)
      : (["qep.experience.perform", "qep.experience.manage"] as const);
  requireQepPermission(context, ...perform);
  const kind = String(body.kind ?? "");
  try {
    if (kind === "observation") {
      return data(context, {
        observation: await getExperienceService().addObservation({
          tenantId,
          hostKind,
          hostId: String(body.hostId ?? ""),
          actorId: actorId(context),
          title: String(body.title ?? ""),
          body: String(body.body ?? ""),
          contextId: body.contextId ? String(body.contextId) : undefined,
          criterionId: body.criterionId ? String(body.criterionId) : undefined,
        }),
      });
    }
    if (kind === "issue") {
      return data(context, {
        issue: await getExperienceService().addIssue({
          tenantId,
          hostKind,
          hostId: String(body.hostId ?? ""),
          actorId: actorId(context),
          title: String(body.title ?? ""),
          body: String(body.body ?? ""),
          observationId: body.observationId ? String(body.observationId) : undefined,
          priority: body.priority ? String(body.priority) : undefined,
          contextId: body.contextId ? String(body.contextId) : undefined,
          criterionId: body.criterionId ? String(body.criterionId) : undefined,
        }),
      });
    }
    if (kind === "note") {
      return data(context, {
        note: await getExperienceService().addNote({
          tenantId,
          hostKind,
          hostId: String(body.hostId ?? ""),
          actorId: actorId(context),
          body: String(body.body ?? ""),
        }),
      });
    }
    throw new Error("quality_capture.kind_invalid");
  } catch (error) {
    mapError(error);
  }
}

export async function handleQualityIssueAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const params = await routeContext.params;
  const issueId = requireParam(params, "issueId");
  const body = await readJson(request);
  const action = String(body.action ?? "");
  requireQepPermission(
    context,
    "qep.exploratory.perform",
    "qep.experience.perform",
    "qep.exploratory.manage",
    "qep.experience.manage",
  );
  const svc = getExperienceService();
  try {
    if (action === "dismiss") {
      return data(context, {
        issue: await svc.dismissIssue({ tenantId, issueId, actorId: actorId(context) }),
      });
    }
    if (action === "resolve") {
      return data(context, {
        issue: await svc.resolveIssue({ tenantId, issueId, actorId: actorId(context) }),
      });
    }
    if (action === "link_defect") {
      requireQepPermission(context, "qep.defects.update", "qep.defects.create");
      return data(context, {
        issue: await svc.linkIssueDefect({
          tenantId,
          issueId,
          defectId: String(body.defectId ?? ""),
          actorId: actorId(context),
        }),
      });
    }
    if (action === "promote_defect") {
      requireQepPermission(context, "qep.defects.create");
      const existing = await svc.getIssue(tenantId, issueId);
      const { service } = getDefectRuntime();
      const defect = await service.create(
        {
          userId: actorId(context),
          tenantId,
          permissions: context.serviceContext.permissions,
        },
        {
          title: existing.title,
          description: existing.body,
          projectId: existing.applicationId,
          qualityOrigin: {
            issueId: existing.id,
            ...(existing.observationId
              ? { observationId: existing.observationId }
              : {}),
            ...(existing.hostKind === "exploratory_session"
              ? { exploratorySessionId: existing.hostId }
              : {}),
            ...(existing.hostKind === "experience_verification"
              ? { experienceActivityId: existing.hostId }
              : {}),
            ...(existing.criterionId ? { criterionId: existing.criterionId } : {}),
            ...(existing.contextId ? { experienceContextId: existing.contextId } : {}),
          },
        },
        new Date().toISOString(),
      );
      return data(context, {
        issue: await svc.linkIssueDefect({
          tenantId,
          issueId,
          defectId: defect.defectId,
          actorId: actorId(context),
          promoted: true,
        }),
        defect,
      });
    }
    throw new Error("quality_issue.action_invalid");
  } catch (error) {
    mapError(error);
  }
}

export async function handleAttachQualityEvidence(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.evidence.associate",
    "qep.exploratory.perform",
    "qep.experience.perform",
  );
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  try {
    await getExperienceService().attachEvidence({
      tenantId,
      actorId: actorId(context),
      evidenceId: String(body.evidenceId ?? ""),
      targetKind: String(body.targetKind ?? ""),
      targetId: String(body.targetId ?? ""),
    });
    return data(context, { attached: true });
  } catch (error) {
    mapError(error);
  }
}

export async function handleAddQualityTrace(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.exploratory.manage",
    "qep.experience.manage",
    "qep.traceability.trace_links.create",
  );
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const fromKind = String(body.fromKind ?? "");
  if (fromKind !== "exploratory_session" && fromKind !== "experience_plan") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "fromKind invalid",
    });
  }
  try {
    await getExperienceService().addTrace({
      tenantId,
      actorId: actorId(context),
      fromKind,
      fromId: String(body.fromId ?? ""),
      toKind: String(body.toKind ?? ""),
      toId: String(body.toId ?? ""),
    });
    return data(context, { linked: true });
  } catch (error) {
    mapError(error);
  }
}
