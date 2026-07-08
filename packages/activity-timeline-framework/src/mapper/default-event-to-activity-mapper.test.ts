import { describe, expect, it } from "vitest";

import type { EventEnvelope } from "@apzhub/event-notification-framework";

import { bootstrapActivityRegistry } from "../bootstrap/bootstrap-activity-registry";
import { createDefaultActivityRegistry } from "../registry/default-activity-registry";
import { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";
import {
  buildActivityDocumentId,
  createDefaultActivityMapperRegistry,
  createDefaultEventToActivityMapper,
  renderActivityTemplate,
  resolveActivityTypes,
} from "./index";

const ACTION_EVENT: EventEnvelope = {
  envelopeId: "env-action-1",
  eventId: "capability.action.executed",
  eventVersion: "1.0.0",
  category: "capability",
  correlationId: "corr-action-1",
  timestamp: "2026-07-04T12:00:00.000Z",
  publisher: "command-framework",
  actorId: "user-42",
  payload: {
    actionId: "platform.theme.toggle",
  },
};

const LIFECYCLE_EVENT: EventEnvelope = {
  envelopeId: "env-lifecycle-1",
  eventId: "platform.lifecycle.started",
  eventVersion: "1.0.0",
  category: "system",
  correlationId: "corr-lifecycle-1",
  timestamp: "2026-07-04T12:01:00.000Z",
  publisher: "platform-runtime",
  payload: {},
};

describe("renderActivityTemplate", () => {
  it("substitutes event, actor, and payload placeholders", () => {
    const rendered = renderActivityTemplate(
      "{{event.id}} / {{event.category}} / {{event.timestamp}} / {{actor.id}} / {{payload.actionId}}",
      ACTION_EVENT,
    );

    expect(rendered).toBe(
      "capability.action.executed / capability / 2026-07-04T12:00:00.000Z / user-42 / platform.theme.toggle",
    );
  });

  it("leaves unknown placeholders as empty strings", () => {
    expect(renderActivityTemplate("{{payload.missing}}", ACTION_EVENT)).toBe("");
  });
});

describe("resolveActivityTypes", () => {
  it("resolves exact and prefix wildcard sourceEventPattern values", () => {
    const registry = createDefaultActivityRegistry();
    registry.register({
      activityTypeId: "capability.action.executed.exact",
      version: "1.0.0",
      sourceEventPattern: "capability.action.executed",
      category: "capability",
      timelineScopes: [TIMELINE_SCOPE_PERSONAL],
      templateRef: "exact",
      label: "Exact action",
      status: "active",
    });
    registry.register({
      activityTypeId: "capability.action.prefix",
      version: "1.0.0",
      sourceEventPattern: "capability.action.*",
      category: "capability",
      timelineScopes: [TIMELINE_SCOPE_PERSONAL],
      templateRef: "prefix",
      label: "Prefix action",
      status: "active",
    });

    const exactMatches = resolveActivityTypes(registry, "capability.action.executed");
    expect(exactMatches.map((type) => type.activityTypeId)).toEqual([
      "capability.action.executed.exact",
      "capability.action.prefix",
    ]);

    const prefixOnly = resolveActivityTypes(registry, "capability.action.scheduled");
    expect(prefixOnly.map((type) => type.activityTypeId)).toEqual([
      "capability.action.prefix",
    ]);
  });

  it("skips planned and disabled activity types by default", () => {
    const registry = createDefaultActivityRegistry();
    registry.register({
      activityTypeId: "planned.type",
      version: "1.0.0",
      sourceEventPattern: "platform.lifecycle.started",
      category: "system",
      timelineScopes: [TIMELINE_SCOPE_PERSONAL],
      templateRef: "planned",
      status: "planned",
    });
    registry.register({
      activityTypeId: "disabled.type",
      version: "1.0.0",
      sourceEventPattern: "platform.lifecycle.started",
      category: "system",
      timelineScopes: [TIMELINE_SCOPE_PERSONAL],
      templateRef: "disabled",
      status: "disabled",
    });

    expect(resolveActivityTypes(registry, "platform.lifecycle.started")).toEqual([]);
  });
});

describe("DefaultEventToActivityMapper", () => {
  it("creates immutable activity documents for matching activity types", () => {
    const bootstrap = bootstrapActivityRegistry();
    const mapper = createDefaultEventToActivityMapper({
      activityRegistry: bootstrap.registry,
    });

    const result = mapper.map(ACTION_EVENT);

    expect(result.ok).toBe(true);
    expect(result.matchedTypeCount).toBe(1);
    expect(result.createdCount).toBe(1);
    expect(result.documents[0]?.activityTypeId).toBe("platform.action.executed");
    expect(result.documents[0]?.sourceEventId).toBe("capability.action.executed");
    expect(result.documents[0]?.actor.id).toBe("user-42");
    expect(Object.isFrozen(result.documents[0])).toBe(true);
    expect(Object.isFrozen(result.documents[0]?.metadata)).toBe(true);
    expect(Object.isFrozen(result.documents[0]?.diagnostics)).toBe(true);
  });

  it("returns deterministic activity ids and mapping output", () => {
    const bootstrap = bootstrapActivityRegistry();
    const mapper = createDefaultEventToActivityMapper({
      activityRegistry: bootstrap.registry,
    });

    const first = mapper.map(LIFECYCLE_EVENT);
    const second = mapper.map(LIFECYCLE_EVENT);

    expect(first.documents[0]?.activityId).toBe(
      buildActivityDocumentId(LIFECYCLE_EVENT.envelopeId, "platform.lifecycle.started"),
    );
    expect(first.documents.map((doc) => doc.activityId)).toEqual(
      second.documents.map((doc) => doc.activityId),
    );
  });

  it("reports NO_MATCH for unmatched events", () => {
    const bootstrap = bootstrapActivityRegistry();
    const mapper = createDefaultEventToActivityMapper({
      activityRegistry: bootstrap.registry,
    });

    const result = mapper.map({
      ...ACTION_EVENT,
      envelopeId: "env-unknown",
      eventId: "capability.unknown.event",
    });

    expect(result.createdCount).toBe(0);
    expect(result.documents).toEqual([]);
    expect(result.issues[0]?.code).toBe("NO_MATCH");
  });

  it("renders custom templates from ActivityMapperRegistry", () => {
    const bootstrap = bootstrapActivityRegistry();
    const templateRegistry = createDefaultActivityMapperRegistry();
    templateRegistry.register({
      activityTypeId: "platform.action.executed",
      titleTemplate: "Action {{payload.actionId}} by {{actor.id}}",
      descriptionTemplate: "{{event.id}} at {{event.timestamp}}",
    });

    const mapper = createDefaultEventToActivityMapper({
      activityRegistry: bootstrap.registry,
      templateRegistry,
    });

    const result = mapper.map(ACTION_EVENT);

    expect(result.documents[0]?.title).toBe("Action platform.theme.toggle by user-42");
    expect(result.documents[0]?.description).toBe(
      "capability.action.executed at 2026-07-04T12:00:00.000Z",
    );
    expect(result.documents[0]?.diagnostics.templateStatus).toBe("ok");
    expect(result.documents[0]?.diagnostics.matchedActivityTypeId).toBe(
      "platform.action.executed",
    );
  });

  it("reports template errors without throwing", () => {
    const bootstrap = bootstrapActivityRegistry();
    const templateRegistry = createDefaultActivityMapperRegistry();
    const mapper = createDefaultEventToActivityMapper({
      activityRegistry: bootstrap.registry,
      templateRegistry,
    });
    templateRegistry.replace({
      activityTypeId: "platform.action.executed",
      titleTemplate: "   ",
      descriptionTemplate: "valid",
    });

    const result = mapper.map(ACTION_EVENT);

    expect(result.createdCount).toBe(0);
    expect(result.issues[0]?.code).toBe("TEMPLATE_ERROR");
    expect(mapper.getDiagnostics().templateErrorCount).toBe(1);
  });

  it("exposes mapper diagnostics after mapping", () => {
    const bootstrap = bootstrapActivityRegistry();
    const mapper = createDefaultEventToActivityMapper({
      activityRegistry: bootstrap.registry,
    });

    mapper.map(ACTION_EVENT);
    const diagnostics = mapper.getDiagnostics();

    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.lastMappedCount).toBe(1);
    expect(diagnostics.lastMatchedTypeCount).toBe(1);
    expect(diagnostics.lastSourceEventId).toBe("capability.action.executed");
    expect(diagnostics.mappedCount).toBe(1);
  });
});
