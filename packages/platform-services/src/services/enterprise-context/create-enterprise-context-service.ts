import type {
  ComposeEnterpriseContextInput,
  ContextFocusType,
  ContextProviderTiming,
  ContextSlice,
  EnterpriseContextComposition,
  EnterpriseContextCompositionService,
  KnowledgeObject,
  Project,
  ServiceRequestContext,
  SupportTicket,
} from "@apzhub/platform-service-contracts";
import { CONTEXT_FOCUS_TYPES } from "@apzhub/platform-service-contracts";

import { composeEnterpriseContext } from "./compose-enterprise-context";
import {
  collectDocumentsSlice,
  collectKnowledgeSlice,
  collectLawSlice,
  collectProjectsSlice,
  collectSupportSlice,
  collectWorkflowSlice,
  type EnterpriseContextProviderDeps,
} from "./providers";

async function timedSlice(
  providerId: ContextProviderTiming["providerId"],
  run: () => Promise<ContextSlice>,
): Promise<{ readonly slice: ContextSlice; readonly timing: ContextProviderTiming }> {
  const started = Date.now();
  const slice = await run();
  const status: ContextProviderTiming["status"] =
    slice.absenceReason === "unavailable"
      ? "unavailable"
      : slice.absenceReason === "denied"
        ? "denied"
        : slice.fragments.length === 0
          ? "empty"
          : "ok";
  return {
    slice,
    timing: Object.freeze({
      providerId,
      durationMs: Date.now() - started,
      status,
    }),
  };
}

/**
 * Minimal gateway slice for Enterprise Context composition.
 * Avoids coupling the composer to the full PlatformServiceGateway type.
 */
export type EnterpriseContextGatewaySlice = {
  readonly projects?: {
    getProject: (ctx: ServiceRequestContext, projectId: string) => Promise<Project>;
    listProjects?: (
      ctx: ServiceRequestContext,
      query?: { readonly page?: { readonly perPage?: number } },
    ) => Promise<{ readonly items: readonly Project[] }>;
  };
  readonly support?: {
    listSupportRequests: (
      ctx: ServiceRequestContext,
      query?: {
        readonly page?: { readonly perPage?: number };
      },
    ) => Promise<{ readonly items: readonly SupportTicket[] }>;
  };
  readonly workflow?: {
    readonly tasks: {
      listInbox: (
        ctx: ServiceRequestContext,
        input?: { readonly limit?: number },
      ) => Promise<
        readonly {
          readonly id: string;
          readonly title: string;
          readonly description?: string;
          readonly status: string;
          readonly kind?: string;
          readonly dueAt?: string;
          readonly updatedAt: string;
          readonly formValues?: Readonly<Record<string, unknown>>;
        }[]
      >;
    };
  };
  readonly documentSearchMetadata?: {
    find: (
      ctx: ServiceRequestContext,
      input?: { readonly query?: string; readonly limit?: number },
    ) => Promise<
      readonly {
        readonly documentId: string;
        readonly title: string;
        readonly status: string;
        readonly updatedAt: string;
        readonly tagNames: readonly string[];
      }[]
    >;
  };
  readonly organisationalMemory?: {
    list: (ctx: ServiceRequestContext) => Promise<readonly KnowledgeObject[]>;
  };
};

function buildDeps(
  gateway: EnterpriseContextGatewaySlice,
): EnterpriseContextProviderDeps {
  return {
    listProjects: gateway.projects?.listProjects
      ? async (ctx) => {
          const page = await gateway.projects!.listProjects!(ctx, {
            page: { perPage: 50 },
          });
          return page.items;
        }
      : undefined,
    listWorkflowInbox: gateway.workflow
      ? (ctx) => gateway.workflow!.tasks.listInbox(ctx, { limit: 50 })
      : undefined,
    listSupportRequests: gateway.support
      ? async (ctx) => {
          const page = await gateway.support!.listSupportRequests(ctx, {
            page: { perPage: 50 },
          });
          return page.items;
        }
      : undefined,
    findDocuments: gateway.documentSearchMetadata
      ? (ctx, query) => gateway.documentSearchMetadata!.find(ctx, { query, limit: 25 })
      : undefined,
    listKnowledgeObjects: gateway.organisationalMemory
      ? (ctx) => gateway.organisationalMemory!.list(ctx)
      : undefined,
  };
}

function isFocusType(value: string): value is ContextFocusType {
  return (CONTEXT_FOCUS_TYPES as readonly string[]).includes(value);
}

export async function composeEnterpriseContextFromGateway(
  ctx: ServiceRequestContext,
  gateway: EnterpriseContextGatewaySlice,
  input: ComposeEnterpriseContextInput,
): Promise<EnterpriseContextComposition> {
  if (!isFocusType(input.focusType)) {
    throw new Error("enterprise_context_focus_unsupported");
  }

  let focusName = input.focusName ?? input.projectName;
  let focusIdentifier = input.focusIdentifier ?? input.projectIdentifier;

  if (
    input.focusType === "project" &&
    gateway.projects &&
    (!focusName || !focusIdentifier)
  ) {
    try {
      const project = await gateway.projects.getProject(ctx, input.focusId);
      focusName = focusName ?? project.name;
      focusIdentifier = focusIdentifier ?? project.identifier;
    } catch {
      // Focus metadata is optional for composition; providers degrade honestly.
    }
  }

  const focus = Object.freeze({
    type: input.focusType,
    id: input.focusId,
    name: focusName,
    identifier: focusIdentifier,
  });

  const now = input.now ?? new Date();
  const deps = buildDeps(gateway);
  const started = Date.now();

  // Providers run in parallel; each is individually resilient (safeSlice).
  const timed = await Promise.all([
    timedSlice("projects", () => collectProjectsSlice(ctx, focus, deps)),
    timedSlice("workflow", () => collectWorkflowSlice(ctx, focus, deps)),
    timedSlice("support", () => collectSupportSlice(ctx, focus, deps)),
    timedSlice("documents", () => collectDocumentsSlice(ctx, focus, deps)),
    timedSlice("law", () => collectLawSlice(focus)),
    timedSlice("knowledge", () => collectKnowledgeSlice(ctx, focus, deps)),
  ]);

  const composition = composeEnterpriseContext(
    timed.map((entry) => entry.slice),
    focus,
    { now },
  );
  return Object.freeze({
    ...composition,
    actorId: ctx.userId,
    operational: Object.freeze({
      totalMs: Date.now() - started,
      providers: Object.freeze(timed.map((entry) => entry.timing)),
    }),
  });
}

export function createEnterpriseContextCompositionService(
  gateway: EnterpriseContextGatewaySlice,
): EnterpriseContextCompositionService {
  return {
    compose(ctx, input) {
      return composeEnterpriseContextFromGateway(ctx, gateway, input);
    },
  };
}
