/**
 * Platform-owned Cross-Product Automation Foundation (APZHUB-1.1-004).
 *
 * Path:
 *   Domain Event → match registrations (+ optional Workflow event bindings)
 *     → platform.handler | workflow.trigger (deferred while execute gated)
 *     → idempotent execution journal (PostgreSQL SoR — APZHUB-ENG-0001)
 */

import type { DomainEventEnvelope } from "../../events/domain-event-publisher";

import {
  AUTOMATION_JOURNAL_HANDLER_ID,
  createAutomationHandlerRegistry,
  createAutomationJournalHandler,
  type AutomationHandlerRegistry,
} from "./automation-handler-registry";
import {
  createInMemoryAutomationExecutionJournal,
  nextAutomationExecutionId,
  type AutomationExecutionJournal,
} from "./automation-execution-journal";
import {
  createInMemoryAutomationRegistrationStore,
  type AutomationRegistrationStore,
} from "./automation-registration-store";
import { matchesEventPattern } from "./match-event-pattern";
import type {
  AutomationExecutionRecord,
  AutomationHandler,
  AutomationRegistration,
  RegisterAutomationInput,
  WorkflowEventTriggerSource,
} from "./types";

export interface AutomationFoundation {
  register(input: RegisterAutomationInput): AutomationRegistration;
  getByKey(key: string): AutomationRegistration | undefined;
  list(filter?: {
    readonly tenantId?: string;
    readonly enabledOnly?: boolean;
  }): readonly AutomationRegistration[];
  setEnabled(key: string, enabled: boolean): AutomationRegistration | undefined;
  registerHandler(handlerId: string, handler: AutomationHandler): void;
  attachWorkflowEventTriggerSource(source: WorkflowEventTriggerSource): void;
  /**
   * Dispatch a domain event through registered automations.
   * Fail-soft — never throws into the Event Bus publish path.
   */
  handleDomainEvent(
    envelope: DomainEventEnvelope,
  ): Promise<readonly AutomationExecutionRecord[]>;
  listExecutions(filter?: {
    readonly envelopeId?: string;
    readonly registrationId?: string;
    readonly eventId?: string;
  }): Promise<readonly AutomationExecutionRecord[]>;
}

export interface CreateAutomationFoundationOptions {
  readonly registrationStore?: AutomationRegistrationStore;
  readonly handlerRegistry?: AutomationHandlerRegistry;
  readonly journal?: AutomationExecutionJournal;
  readonly workflowEventTriggerSource?: WorkflowEventTriggerSource;
  /** When false, skip built-in journal handler registration. Default true. */
  readonly registerJournalHandler?: boolean;
}

export function createAutomationFoundation(
  options: CreateAutomationFoundationOptions = {},
): AutomationFoundation {
  const registrationStore =
    options.registrationStore ?? createInMemoryAutomationRegistrationStore();
  const handlerRegistry = options.handlerRegistry ?? createAutomationHandlerRegistry();
  const journal = options.journal ?? createInMemoryAutomationExecutionJournal();
  let workflowSource = options.workflowEventTriggerSource;

  if (options.registerJournalHandler !== false) {
    handlerRegistry.register(
      AUTOMATION_JOURNAL_HANDLER_ID,
      createAutomationJournalHandler(),
    );
  }

  async function executeRegistration(
    envelope: DomainEventEnvelope,
    registration: AutomationRegistration,
  ): Promise<AutomationExecutionRecord> {
    if (await journal.hasProcessed(envelope.envelopeId, registration.id)) {
      return {
        id: nextAutomationExecutionId(),
        registrationId: registration.id,
        registrationKey: registration.key,
        eventId: envelope.eventId,
        envelopeId: envelope.envelopeId,
        status: "skipped",
        reason: "IDEMPOTENT_SKIP",
        correlationId: envelope.correlationId,
        tenantId: envelope.tenantId,
        executedAt: new Date().toISOString(),
      };
    }

    if (
      registration.tenantId !== undefined &&
      envelope.tenantId !== undefined &&
      registration.tenantId !== envelope.tenantId
    ) {
      const skipped: AutomationExecutionRecord = {
        id: nextAutomationExecutionId(),
        registrationId: registration.id,
        registrationKey: registration.key,
        eventId: envelope.eventId,
        envelopeId: envelope.envelopeId,
        status: "skipped",
        reason: "TENANT_MISMATCH",
        correlationId: envelope.correlationId,
        tenantId: envelope.tenantId,
        executedAt: new Date().toISOString(),
      };
      await journal.record(skipped);
      return skipped;
    }

    try {
      if (registration.actionKind === "platform.handler") {
        const handler = handlerRegistry.get(registration.actionRef);
        if (!handler) {
          const failed: AutomationExecutionRecord = {
            id: nextAutomationExecutionId(),
            registrationId: registration.id,
            registrationKey: registration.key,
            eventId: envelope.eventId,
            envelopeId: envelope.envelopeId,
            status: "failed",
            reason: "HANDLER_NOT_FOUND",
            correlationId: envelope.correlationId,
            tenantId: envelope.tenantId,
            executedAt: new Date().toISOString(),
            details: { actionRef: registration.actionRef },
          };
          await journal.record(failed);
          return failed;
        }

        const result = await handler({ envelope, registration });
        const record: AutomationExecutionRecord = {
          id: nextAutomationExecutionId(),
          registrationId: registration.id,
          registrationKey: registration.key,
          eventId: envelope.eventId,
          envelopeId: envelope.envelopeId,
          status: result.status,
          reason: result.reason,
          correlationId: envelope.correlationId,
          tenantId: envelope.tenantId,
          executedAt: new Date().toISOString(),
          details: result.details,
        };
        await journal.record(record);
        return record;
      }

      // workflow.trigger — record deferred intent; n8n execute remains gated.
      const deferred: AutomationExecutionRecord = {
        id: nextAutomationExecutionId(),
        registrationId: registration.id,
        registrationKey: registration.key,
        eventId: envelope.eventId,
        envelopeId: envelope.envelopeId,
        status: "deferred",
        reason: "WORKFLOW_EXECUTE_GATED",
        correlationId: envelope.correlationId,
        tenantId: envelope.tenantId,
        executedAt: new Date().toISOString(),
        details: {
          workflowId: registration.actionRef,
          triggerId: registration.metadata?.triggerId ?? "",
          eventType: envelope.eventId,
        },
      };
      await journal.record(deferred);
      return deferred;
    } catch (error) {
      const failed: AutomationExecutionRecord = {
        id: nextAutomationExecutionId(),
        registrationId: registration.id,
        registrationKey: registration.key,
        eventId: envelope.eventId,
        envelopeId: envelope.envelopeId,
        status: "failed",
        reason: error instanceof Error ? error.message : "HANDLER_FAILED",
        correlationId: envelope.correlationId,
        tenantId: envelope.tenantId,
        executedAt: new Date().toISOString(),
      };
      await journal.record(failed);
      return failed;
    }
  }

  async function handleWorkflowBindings(
    envelope: DomainEventEnvelope,
    results: AutomationExecutionRecord[],
  ): Promise<void> {
    if (!workflowSource) {
      return;
    }

    let bindings: Awaited<
      ReturnType<WorkflowEventTriggerSource["listEnabledEventTriggers"]>
    >;
    try {
      bindings = await workflowSource.listEnabledEventTriggers({
        tenantId: envelope.tenantId,
      });
    } catch {
      return;
    }

    for (const binding of bindings) {
      if (!binding.enabled || !binding.eventType) {
        continue;
      }
      if (!matchesEventPattern(binding.eventType, envelope.eventId)) {
        continue;
      }
      if (envelope.tenantId !== undefined && binding.tenantId !== envelope.tenantId) {
        continue;
      }

      const syntheticKey = `workflow.trigger:${binding.triggerId}`;
      const syntheticId = `auto_wtrg_${binding.triggerId}`;
      if (await journal.hasProcessed(envelope.envelopeId, syntheticId)) {
        results.push({
          id: nextAutomationExecutionId(),
          registrationId: syntheticId,
          registrationKey: syntheticKey,
          eventId: envelope.eventId,
          envelopeId: envelope.envelopeId,
          status: "skipped",
          reason: "IDEMPOTENT_SKIP",
          correlationId: envelope.correlationId,
          tenantId: envelope.tenantId,
          executedAt: new Date().toISOString(),
        });
        continue;
      }

      const deferred: AutomationExecutionRecord = {
        id: nextAutomationExecutionId(),
        registrationId: syntheticId,
        registrationKey: syntheticKey,
        eventId: envelope.eventId,
        envelopeId: envelope.envelopeId,
        status: "deferred",
        reason: "WORKFLOW_EXECUTE_GATED",
        correlationId: envelope.correlationId,
        tenantId: envelope.tenantId,
        executedAt: new Date().toISOString(),
        details: {
          workflowId: binding.workflowId,
          triggerId: binding.triggerId,
          eventType: binding.eventType,
          versionId: binding.versionId ?? "",
        },
      };
      await journal.record(deferred);
      results.push(deferred);
    }
  }

  return {
    register(input) {
      return registrationStore.register(input);
    },
    getByKey(key) {
      return registrationStore.getByKey(key);
    },
    list(filter) {
      return registrationStore.list(filter);
    },
    setEnabled(key, enabled) {
      return registrationStore.setEnabled(key, enabled);
    },
    registerHandler(handlerId, handler) {
      handlerRegistry.register(handlerId, handler);
    },
    attachWorkflowEventTriggerSource(source) {
      workflowSource = source;
    },
    async handleDomainEvent(envelope) {
      const results: AutomationExecutionRecord[] = [];
      try {
        const registrations = registrationStore.list({
          enabledOnly: true,
          tenantId: envelope.tenantId,
        });
        for (const registration of registrations) {
          if (!matchesEventPattern(registration.eventPattern, envelope.eventId)) {
            continue;
          }
          results.push(await executeRegistration(envelope, registration));
        }
        await handleWorkflowBindings(envelope, results);
      } catch {
        // Fail-soft — Event Bus publish path must not throw.
      }
      return results;
    },
    async listExecutions(filter) {
      return journal.list(filter);
    },
  };
}
