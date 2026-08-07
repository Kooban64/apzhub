import type {
  ContextFocus,
  ContextFragment,
  ContextSlice,
  KnowledgeObject,
  Project,
  ServiceRequestContext,
  SupportTicket,
} from "@apzhub/platform-service-contracts";

import { knowledgeFragmentsForFocus, lawFragmentsForFocus } from "./catalogues";
import { focusTagCandidates, matchesFocus } from "./relevance";

export type EnterpriseContextProviderDeps = {
  readonly listProjects?: (ctx: ServiceRequestContext) => Promise<readonly Project[]>;
  readonly listWorkflowInbox?: (ctx: ServiceRequestContext) => Promise<
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
  readonly listSupportRequests?: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly SupportTicket[]>;
  readonly findDocuments?: (
    ctx: ServiceRequestContext,
    query: string,
  ) => Promise<
    readonly {
      readonly documentId: string;
      readonly title: string;
      readonly status: string;
      readonly updatedAt: string;
      readonly tagNames: readonly string[];
    }[]
  >;
  readonly listKnowledgeObjects?: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly KnowledgeObject[]>;
};

async function safeSlice(
  build: () => Promise<ContextSlice>,
  fallback: ContextSlice,
): Promise<ContextSlice> {
  try {
    return await build();
  } catch (error) {
    const message = error instanceof Error ? error.message : "provider_failed";
    return Object.freeze({
      ...fallback,
      fragments: Object.freeze([]),
      absenceReason: "unavailable" as const,
      error: message,
    });
  }
}

function emptySlice(
  providerId: ContextSlice["providerId"],
  productLabel: string,
  absenceReason: ContextSlice["absenceReason"] = "none",
): ContextSlice {
  return Object.freeze({
    providerId,
    sectionId: providerId,
    productLabel,
    fragments: Object.freeze([]),
    absenceReason,
  });
}

function haystackMatch(
  focus: ContextFocus,
  values: readonly (string | undefined | null)[],
): boolean {
  return matchesFocus(focus, values);
}

export async function collectProjectsSlice(
  ctx: ServiceRequestContext,
  focus: ContextFocus,
  deps: EnterpriseContextProviderDeps,
): Promise<ContextSlice> {
  const base = emptySlice("projects", "APZ Projects");

  if (focus.type === "project") {
    return Object.freeze({
      providerId: "projects",
      sectionId: "projects",
      productLabel: "APZ Projects",
      fragments: Object.freeze([
        Object.freeze({
          id: `projects:focus:${focus.id}`,
          providerId: "projects" as const,
          productLabel: "APZ Projects",
          sectionHint: "focus",
          title: focus.name?.trim() || focus.identifier || "Current project",
          summary: "Focus work object — Projects remains the System of Record.",
          href: `/workspace/projects/${focus.id}`,
          sourceEntityRef: focus.id,
          fragmentClass: "entity" as const,
          severity: "info" as const,
        }),
      ]),
    });
  }

  if (!deps.listProjects) {
    return Object.freeze({ ...base, absenceReason: "unavailable" as const });
  }

  return safeSlice(async () => {
    const projects = await deps.listProjects!(ctx);
    const related = projects.filter((project) =>
      haystackMatch(focus, [
        project.id,
        project.name,
        project.identifier,
        focus.name,
        focus.identifier,
      ]),
    );

    // Prefer projects whose id/identifier appear in focus metadata haystacks from other providers.
    const byNeedle = projects.filter((project) =>
      haystackMatch(
        {
          type: "project",
          id: project.id,
          name: project.name,
          identifier: project.identifier,
        },
        [focus.id, focus.name, focus.identifier],
      ),
    );

    const selected = (related.length > 0 ? related : byNeedle).slice(0, 6);

    const fragments: ContextFragment[] = selected.map((project) =>
      Object.freeze({
        id: `projects:related:${project.id}`,
        providerId: "projects" as const,
        productLabel: "APZ Projects",
        sectionHint: "related",
        title: project.name,
        summary: project.identifier
          ? `Identifier ${project.identifier}`
          : "Related project",
        href: `/workspace/projects/${project.id}`,
        sourceEntityRef: project.id,
        fragmentClass: "entity" as const,
        severity: "info" as const,
      }),
    );

    return Object.freeze({
      providerId: "projects",
      sectionId: "projects",
      productLabel: "APZ Projects",
      fragments: Object.freeze(fragments),
      absenceReason: fragments.length === 0 ? ("none" as const) : undefined,
    });
  }, base);
}

export async function collectWorkflowSlice(
  ctx: ServiceRequestContext,
  focus: ContextFocus,
  deps: EnterpriseContextProviderDeps,
): Promise<ContextSlice> {
  const base = emptySlice("workflow", "APZ Workflow");
  if (!deps.listWorkflowInbox) {
    return Object.freeze({ ...base, absenceReason: "unavailable" as const });
  }

  return safeSlice(async () => {
    const tasks = await deps.listWorkflowInbox!(ctx);
    const related =
      focus.type === "workflow"
        ? tasks.filter(
            (task) =>
              task.id === focus.id ||
              haystackMatch(focus, [
                task.title,
                task.description,
                typeof task.formValues?.journeyId === "string"
                  ? task.formValues.journeyId
                  : undefined,
              ]),
          )
        : tasks.filter((task) =>
            haystackMatch(focus, [
              task.title,
              task.description,
              typeof task.formValues?.projectId === "string"
                ? task.formValues.projectId
                : undefined,
              typeof task.formValues?.projectIdentifier === "string"
                ? task.formValues.projectIdentifier
                : undefined,
              typeof task.formValues?.supportRequestId === "string"
                ? task.formValues.supportRequestId
                : undefined,
              typeof task.formValues?.knowledgeId === "string"
                ? task.formValues.knowledgeId
                : undefined,
            ]),
          );

    const fragments: ContextFragment[] = [];
    const open = related.filter(
      (task) => task.status !== "completed" && task.status !== "cancelled",
    );

    if (focus.type === "knowledge" && open.length === 0) {
      fragments.push(
        Object.freeze({
          id: `workflow:usage:${focus.id}`,
          providerId: "workflow",
          productLabel: "APZ Workflow",
          sectionHint: "usage",
          title: "Workflow usage of this memory",
          summary:
            "No active workflow items currently reference this organisational memory.",
          href: "/workspace/workflow",
          fragmentClass: "guidance",
          severity: "info",
        }),
      );
    } else if (open.length > 0) {
      const approvals = open.filter((task) => task.kind === "approval");
      const waiting = open.filter((task) => task.kind !== "approval");

      fragments.push(
        Object.freeze({
          id: `workflow:stage:${focus.id}`,
          providerId: "workflow",
          productLabel: "APZ Workflow",
          sectionHint: "stage",
          title:
            approvals.length > 0
              ? "Awaiting governance approvals"
              : "Active workflow work",
          summary: `${open.length} open workflow item(s) related to this focus.`,
          href: "/workspace/workflow",
          fragmentClass: "guidance",
          severity: approvals.length > 0 ? "attention" : "info",
        }),
      );

      for (const task of approvals.slice(0, 5)) {
        fragments.push(
          Object.freeze({
            id: `workflow:approval:${task.id}`,
            providerId: "workflow",
            productLabel: "APZ Workflow",
            sectionHint: "approvals",
            title: task.title.trim() || "Outstanding approval",
            summary: task.description,
            href: `/workspace/workflow/tasks/${task.id}`,
            sourceEntityRef: task.id,
            fragmentClass: "entity",
            severity: "attention",
            updatedAt: task.updatedAt,
          }),
        );
      }

      for (const task of waiting.slice(0, 5)) {
        fragments.push(
          Object.freeze({
            id: `workflow:waiting:${task.id}`,
            providerId: "workflow",
            productLabel: "APZ Workflow",
            sectionHint: "waiting",
            title: task.title.trim() || "Waiting action",
            summary: task.description,
            href: `/workspace/workflow/tasks/${task.id}`,
            sourceEntityRef: task.id,
            fragmentClass: "entity",
            severity: "info",
            updatedAt: task.updatedAt,
          }),
        );
      }
    }

    return Object.freeze({
      providerId: "workflow",
      sectionId: "workflow",
      productLabel: "APZ Workflow",
      fragments: Object.freeze(fragments),
      absenceReason: fragments.length === 0 ? ("none" as const) : undefined,
    });
  }, base);
}

export async function collectSupportSlice(
  ctx: ServiceRequestContext,
  focus: ContextFocus,
  deps: EnterpriseContextProviderDeps,
): Promise<ContextSlice> {
  const base = emptySlice("support", "APZ Support");
  if (!deps.listSupportRequests) {
    return Object.freeze({ ...base, absenceReason: "unavailable" as const });
  }

  return safeSlice(async () => {
    const tickets = await deps.listSupportRequests!(ctx);
    const tagNeedles = focusTagCandidates(focus).map((t) => t.toLowerCase());

    const related =
      focus.type === "support"
        ? tickets.filter((ticket) => ticket.id === focus.id)
        : tickets.filter((ticket) => {
            const tags = (ticket.tags ?? []).map((t) => t.toLowerCase());
            const tagHit = tags.some((tag) =>
              tagNeedles.some((needle) => tag.includes(needle)),
            );
            return (
              tagHit || haystackMatch(focus, [ticket.title, ...(ticket.tags ?? [])])
            );
          });

    const open = related.filter(
      (ticket) =>
        ticket.status === "new" ||
        ticket.status === "open" ||
        ticket.status === "pending" ||
        focus.type === "support",
    );

    const fragments: ContextFragment[] = open.slice(0, 8).map((ticket) => {
      const critical = ticket.priority === "urgent" || ticket.priority === "high";
      const escalated = (ticket.tags ?? []).some((tag) => /escalat/i.test(tag));
      return Object.freeze({
        id: `support:request:${ticket.id}`,
        providerId: "support" as const,
        productLabel: "APZ Support",
        sectionHint: escalated ? "escalations" : critical ? "critical" : "open",
        title: ticket.title,
        summary: `Status ${ticket.status} · Priority ${ticket.priority}`,
        href: `/workspace/support/requests/${ticket.id}`,
        sourceEntityRef: ticket.id,
        fragmentClass: "entity" as const,
        severity:
          critical || escalated ? ("critical" as const) : ("attention" as const),
        updatedAt: ticket.updatedAt,
      });
    });

    return Object.freeze({
      providerId: "support",
      sectionId: "support",
      productLabel: "APZ Support",
      fragments: Object.freeze(fragments),
      absenceReason: fragments.length === 0 ? ("none" as const) : undefined,
    });
  }, base);
}

export async function collectDocumentsSlice(
  ctx: ServiceRequestContext,
  focus: ContextFocus,
  deps: EnterpriseContextProviderDeps,
): Promise<ContextSlice> {
  const base = emptySlice("documents", "APZ Documents");
  if (!deps.findDocuments) {
    return Object.freeze({ ...base, absenceReason: "unavailable" as const });
  }

  return safeSlice(async () => {
    const query = focus.identifier || focus.name || focus.id;
    const docs = await deps.findDocuments!(ctx, query);
    const related = docs.filter((doc) =>
      haystackMatch(focus, [doc.title, ...doc.tagNames]),
    );

    const fragments: ContextFragment[] = [];

    for (const doc of related.slice(0, 8)) {
      const approved = /approved|published|released/i.test(doc.status);
      const missing = /missing|draft|required/i.test(doc.status);
      fragments.push(
        Object.freeze({
          id: `documents:doc:${doc.documentId}`,
          providerId: "documents",
          productLabel: "APZ Documents",
          sectionHint: missing ? "missing" : approved ? "approved" : "relevant",
          title: doc.title,
          summary: `Lifecycle: ${doc.status}`,
          href: `/workspace/documents/${doc.documentId}`,
          sourceEntityRef: doc.documentId,
          fragmentClass: "entity",
          severity: missing ? "attention" : "info",
          updatedAt: doc.updatedAt,
        }),
      );
    }

    return Object.freeze({
      providerId: "documents",
      sectionId: "documents",
      productLabel: "APZ Documents",
      fragments: Object.freeze(fragments),
      absenceReason: fragments.length === 0 ? ("none" as const) : undefined,
    });
  }, base);
}

export async function collectLawSlice(focus: ContextFocus): Promise<ContextSlice> {
  try {
    const fragments = lawFragmentsForFocus(focus);
    return Object.freeze({
      providerId: "law",
      sectionId: "law",
      productLabel: "APZ Law",
      fragments,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "provider_failed";
    return Object.freeze({
      ...emptySlice("law", "APZ Law", "unavailable"),
      error: message,
    });
  }
}

export async function collectKnowledgeSlice(
  ctx: ServiceRequestContext,
  focus: ContextFocus,
  deps: EnterpriseContextProviderDeps,
): Promise<ContextSlice> {
  const base = emptySlice("knowledge", "APZ Knowledge");

  return safeSlice(async () => {
    const catalogue = [...knowledgeFragmentsForFocus(focus)];
    const live: ContextFragment[] = [];

    if (deps.listKnowledgeObjects) {
      try {
        const objects = await deps.listKnowledgeObjects(ctx);
        const related = objects.filter((object) => {
          if (focus.type === "knowledge") {
            return (
              object.id === focus.id ||
              object.relatedProducts.some((p) =>
                /project|workflow|support|analytics/i.test(p),
              )
            );
          }
          return (
            haystackMatch(focus, [
              object.title,
              object.summary,
              ...object.tags,
              ...object.relatedProducts,
              ...object.relatedCapabilities,
              object.decisionRef,
            ]) || object.status === "approved"
          );
        });

        for (const object of related.slice(0, 6)) {
          const hint =
            object.kind === "lesson"
              ? "lessons"
              : object.kind === "decision_knowledge"
                ? "decisions"
                : object.libraryCategory === "procedures"
                  ? "procedures"
                  : object.libraryCategory === "standards"
                    ? "standards"
                    : "guidance";
          live.push(
            Object.freeze({
              id: `knowledge:live:${object.id}`,
              providerId: "knowledge",
              productLabel: "APZ Knowledge",
              sectionHint: hint,
              title: object.title,
              summary: object.summary,
              href: `/workspace/knowledge/objects/${object.id}`,
              sourceEntityRef: object.id,
              fragmentClass: "entity",
              severity: object.status === "approved" ? "info" : "attention",
              updatedAt: object.updatedAt,
            }),
          );
        }
      } catch {
        // Live knowledge failure must not wipe catalogue — partial composition.
      }
    }

    const fragments =
      live.length > 0
        ? Object.freeze([...live, ...catalogue.slice(0, 2)])
        : Object.freeze(catalogue);

    return Object.freeze({
      providerId: "knowledge",
      sectionId: "knowledge",
      productLabel: "APZ Knowledge",
      fragments,
      absenceReason: fragments.length === 0 ? ("none" as const) : undefined,
    });
  }, base);
}
