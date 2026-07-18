import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  isPlatformServiceError,
  PlatformServiceError,
  type PlatformServiceErrorCode,
} from "@apzhub/platform-service-contracts";

import type { AuthorizationProvider } from "../authorization/authorization-provider";
import { AllowAllAuthorizationProvider } from "../authorization/authorization-provider";
import type { AuthorizationAuditSink } from "../authorization/authorization-audit";
import { noopAuthorizationAuditSink } from "../authorization/authorization-audit";
import type { ProductionAuthorizationDecision } from "../authorization/production-authorization-provider";
import {
  extractResourceId,
  resolveOperationAuthorization,
} from "../authorization/operation-authorization-map";
import {
  MiddlewareRegistry,
  type ServiceMiddleware,
} from "../middleware/service-middleware";
import { PolicyPipeline, type Policy } from "../policy/policy-pipeline";
import { createRequestId, noopPipelineLogger, type PipelineLogger } from "./logging";
import { noopPipelineMetrics, type PipelineMetrics } from "./metrics";

export interface PipelineOperationInput<TResult> {
  readonly service: string;
  readonly operation: string;
  readonly context: ServiceRequestContext;
  readonly args: readonly unknown[];
  readonly invoke: (
    context: ServiceRequestContext,
    args: readonly unknown[],
  ) => Promise<TResult>;
}

export interface RequestPipelineOptions {
  readonly logger?: PipelineLogger;
  readonly metrics?: PipelineMetrics;
  readonly authorization?: AuthorizationProvider;
  readonly policies?: readonly Policy[];
  readonly middlewares?: readonly ServiceMiddleware[];
  /** When true, runs AuthorizationProvider before invoke (default: true). */
  readonly enforceAuthorization?: boolean;
  readonly auditSink?: AuthorizationAuditSink;
}

/**
 * Standard execution pipeline for all platform service requests.
 *
 * Order (OSS-110-06):
 * 1. Request context validation
 * 2. Context enrichment (requestId, execution metadata)
 * 3. Before middleware
 * 4. Policy pipeline (preconditions / governance)
 * 5. Authorization provider (permission decisions)
 * 6. Invoke service operation
 * 7. After middleware
 * 8. Logging + metrics + authz audit
 */
export class RequestPipeline {
  readonly logger: PipelineLogger;
  readonly metrics: PipelineMetrics;
  readonly authorization: AuthorizationProvider;
  readonly policies: PolicyPipeline;
  readonly middlewares: MiddlewareRegistry;
  readonly auditSink: AuthorizationAuditSink;
  private readonly enforceAuthorization: boolean;

  constructor(options: RequestPipelineOptions = {}) {
    this.logger = options.logger ?? noopPipelineLogger;
    this.metrics = options.metrics ?? noopPipelineMetrics;
    this.authorization = options.authorization ?? new AllowAllAuthorizationProvider();
    this.policies = new PolicyPipeline({ policies: options.policies });
    this.middlewares = new MiddlewareRegistry();
    this.enforceAuthorization = options.enforceAuthorization !== false;
    this.auditSink = options.auditSink ?? noopAuthorizationAuditSink;

    for (const middleware of options.middlewares ?? []) {
      this.middlewares.register(middleware);
    }
  }

  registerMiddleware(middleware: ServiceMiddleware): void {
    this.middlewares.register(middleware);
  }

  registerPolicy(policy: Policy): void {
    this.policies.register(policy);
  }

  enrichContext(ctx: ServiceRequestContext): ServiceRequestContext {
    this.assertContext(ctx);

    const requestId = createRequestId(ctx);
    const startedAt = new Date().toISOString();

    return {
      ...ctx,
      requestId,
      execution: {
        ...ctx.execution,
        requestId,
        startedAt,
        source: ctx.execution?.source ?? "platform-services",
        clientVersion: ctx.execution?.clientVersion,
        extras: ctx.execution?.extras,
      },
    };
  }

  assertContext(ctx: ServiceRequestContext): void {
    if (!ctx?.tenantId || !ctx.userId || !ctx.correlationId) {
      throw new PlatformServiceError({
        category: "validation",
        code: "INVALID_REQUEST_CONTEXT",
        message: "Request pipeline requires tenantId, userId, and correlationId",
        correlationId: ctx?.correlationId || "missing",
        retryable: false,
      });
    }
  }

  async execute<TResult>(input: PipelineOperationInput<TResult>): Promise<TResult> {
    const startedAtMs = Date.now();
    let context = this.enrichContext(input.context);
    const requestId = context.requestId!;
    let args = input.args;
    let policyOutcomes: string[] = [];

    this.metrics.record({
      kind: "operation_started",
      service: input.service,
      operation: input.operation,
      correlationId: context.correlationId,
      requestId,
    });

    this.logger.log({
      level: "info",
      message: "platform operation started",
      correlationId: context.correlationId,
      requestId,
      service: input.service,
      operation: input.operation,
      tenantId: context.tenantId,
    });

    try {
      const before = await this.middlewares.runBefore({
        context,
        service: input.service,
        operation: input.operation,
        args,
        requestId,
        startedAtMs,
      });
      context = before.context;
      args = before.args;

      const policyDecisions = await this.policies.assertAllowed({
        context,
        service: input.service,
        operation: input.operation,
        args,
      });
      policyOutcomes = policyDecisions.map(
        (decision) => `${decision.policyId}:${decision.effect}`,
      );

      const operationMapping = resolveOperationAuthorization(
        input.service,
        input.operation,
      );
      const argsAfterContext = isServiceRequestContext(args[0]) ? args.slice(1) : args;
      const resourceId = operationMapping
        ? extractResourceId(operationMapping, argsAfterContext)
        : undefined;

      if (this.enforceAuthorization) {
        const authzStarted = Date.now();
        const decision = (await this.authorization.authorize({
          context,
          action: {
            name: `${input.service}.${input.operation}`,
            attributes: operationMapping
              ? { mappedAction: operationMapping.action }
              : undefined,
          },
          resource: {
            type: operationMapping?.resourceType ?? input.service,
            id: resourceId,
            tenantId: context.tenantId,
            attributes: context.organisationId
              ? { organisationId: context.organisationId }
              : undefined,
          },
          requiredPermissions: operationMapping
            ? [operationMapping.requiredPermission]
            : undefined,
        })) as ProductionAuthorizationDecision;

        this.recordAuthorizationAudit({
          context,
          service: input.service,
          operation: input.operation,
          decision,
          resourceType: operationMapping?.resourceType ?? input.service,
          resourceId,
          action: operationMapping?.action ?? input.operation,
          permission: operationMapping?.requiredPermission,
          policyOutcomes,
          durationMs: Date.now() - authzStarted,
          requestId,
        });

        if (decision.effect === "deny") {
          throw denialToError(decision, context.correlationId);
        }
      }

      const invokeArgs =
        args.length > 0 && isServiceRequestContext(args[0])
          ? [context, ...args.slice(1)]
          : args;

      const result = await input.invoke(context, invokeArgs);
      const durationMs = Date.now() - startedAtMs;

      await this.middlewares.runAfter({
        context,
        service: input.service,
        operation: input.operation,
        args: invokeArgs,
        requestId,
        startedAtMs,
        result,
        durationMs,
      });

      this.metrics.record({
        kind: "operation_succeeded",
        service: input.service,
        operation: input.operation,
        correlationId: context.correlationId,
        requestId,
        durationMs,
      });

      this.logger.log({
        level: "info",
        message: "platform operation succeeded",
        correlationId: context.correlationId,
        requestId,
        service: input.service,
        operation: input.operation,
        tenantId: context.tenantId,
        durationMs,
      });

      return result;
    } catch (error) {
      const durationMs = Date.now() - startedAtMs;
      const platformError = toPlatformError(error, context.correlationId);

      if (isPlatformServiceError(error) && error.code === "POLICY_DENIED") {
        this.recordAuthorizationAudit({
          context,
          service: input.service,
          operation: input.operation,
          decision: {
            effect: "deny",
            reason: platformError.message,
            denialCode: "permission_denied",
          },
          resourceType: input.service,
          policyOutcomes,
          durationMs,
          requestId,
        });
      }

      await this.middlewares.runAfter({
        context,
        service: input.service,
        operation: input.operation,
        args,
        requestId,
        startedAtMs,
        error: platformError,
        durationMs,
      });

      this.metrics.record({
        kind: "operation_failed",
        service: input.service,
        operation: input.operation,
        correlationId: context.correlationId,
        requestId,
        durationMs,
        errorCode: platformError.code,
      });

      this.logger.log({
        level: "error",
        message: "platform operation failed",
        correlationId: context.correlationId,
        requestId,
        service: input.service,
        operation: input.operation,
        tenantId: context.tenantId,
        durationMs,
        errorCode: platformError.code,
        details: { message: platformError.message },
      });

      throw platformError;
    }
  }

  private recordAuthorizationAudit(input: {
    readonly context: ServiceRequestContext;
    readonly service: string;
    readonly operation: string;
    readonly decision: ProductionAuthorizationDecision;
    readonly resourceType?: string;
    readonly resourceId?: string;
    readonly action?: string;
    readonly permission?: string;
    readonly policyOutcomes: readonly string[];
    readonly durationMs: number;
    readonly requestId: string;
  }): void {
    const effectiveActorId = input.context.userId;
    const actorId = input.context.impersonation?.actorUserId ?? effectiveActorId;

    this.auditSink.record({
      type: "authorization.evaluated",
      timestamp: new Date().toISOString(),
      actorId,
      effectiveActorId,
      tenantId: input.context.tenantId,
      organisationId: input.context.organisationId,
      roleNames: input.decision.matchedRoles,
      permission: input.permission,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      action: input.action,
      decision: input.decision.effect,
      denialReason:
        input.decision.effect === "deny" ? input.decision.reason : undefined,
      denialCode: input.decision.denialCode,
      policyOutcomes: input.policyOutcomes,
      impersonation: Boolean(input.context.impersonation?.actorUserId),
      correlationId: input.context.correlationId,
      requestId: input.requestId,
      durationMs: input.durationMs,
      service: input.service,
      operation: input.operation,
    });
  }
}

function isServiceRequestContext(value: unknown): value is ServiceRequestContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "tenantId" in value &&
    "userId" in value &&
    "correlationId" in value
  );
}

function toPlatformError(error: unknown, correlationId: string): PlatformServiceError {
  if (isPlatformServiceError(error)) {
    return error;
  }

  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Platform service operation failed",
    correlationId,
    retryable: false,
  });
}

function denialToError(
  decision: ProductionAuthorizationDecision,
  correlationId: string,
): PlatformServiceError {
  const code = mapDenialToErrorCode(decision.denialCode);
  return new PlatformServiceError({
    category: code === "AUTHENTICATION_REQUIRED" ? "authentication" : "authorization",
    code,
    message: publicDenialMessage(code, decision.reason),
    correlationId,
    retryable: code === "AUTHORIZATION_UNAVAILABLE",
    details: {
      classification: decision.denialCode ?? "permission_denied",
    },
  });
}

function mapDenialToErrorCode(
  denialCode: ProductionAuthorizationDecision["denialCode"],
): PlatformServiceErrorCode {
  switch (denialCode) {
    case "unauthenticated":
      return "AUTHENTICATION_REQUIRED";
    case "invalid_actor":
      return "INVALID_ACTOR";
    case "inactive_actor":
      return "INACTIVE_ACTOR";
    case "tenant_membership_required":
      return "TENANT_MEMBERSHIP_REQUIRED";
    case "organisation_scope_mismatch":
      return "ORGANISATION_SCOPE_MISMATCH";
    case "impersonation_denied":
    case "privilege_escalation_denied":
      return "IMPERSONATION_DENIED";
    case "authorization_unavailable":
      return "AUTHORIZATION_UNAVAILABLE";
    case "permission_denied":
    case "default_deny":
    default:
      return "PERMISSION_DENIED";
  }
}

function publicDenialMessage(code: PlatformServiceErrorCode, reason?: string): string {
  switch (code) {
    case "AUTHENTICATION_REQUIRED":
      return "Authentication required";
    case "INVALID_ACTOR":
      return "Actor is not valid";
    case "INACTIVE_ACTOR":
      return "Actor is not active";
    case "TENANT_MEMBERSHIP_REQUIRED":
      return "Active tenant membership is required";
    case "ORGANISATION_SCOPE_MISMATCH":
      return "Organisation scope is not valid";
    case "IMPERSONATION_DENIED":
      return "Impersonation is not permitted";
    case "AUTHORIZATION_UNAVAILABLE":
      return "Authorization is temporarily unavailable";
    case "PERMISSION_DENIED":
    case "FORBIDDEN":
    default:
      return reason && !/role|permission key|grant|wildcard/i.test(reason)
        ? reason
        : "Permission denied";
  }
}
