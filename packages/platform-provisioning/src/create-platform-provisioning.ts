import {
  createDefaultEventRegistry,
  type EventBus,
  type EventRegistry,
} from "@apzhub/event-notification-framework";
import { createPlatformEventBus } from "@apzhub/platform-event-bus";
import type { PlatformGovernanceService } from "@apzhub/platform-governance";
import type { OutboxHandler, OutboxStore, OutboxWorker } from "@apzhub/platform-outbox";
import { createOutboxWorker } from "@apzhub/platform-outbox";

import {
  createInMemoryProvisioningAuditSink,
  type ProvisioningAuditSink,
} from "./audit";
import { buildProvisioningDiagnostics } from "./diagnostics";
import {
  createProductProvisioningEngine,
  type ProductProvisioningEngine,
} from "./engine";
import { ensureProvisioningEventRegistry } from "./events/registry";
import { createPublishCounters, type PublishCounters } from "./events/publish";
import {
  createInMemoryProvisioningFlowStore,
  type ProvisioningFlowStore,
} from "./flow-store";
import { toProvisioningHealth } from "./health";
import type { ProvisioningDiagnostics, ProvisioningHealth } from "./types";
import { PLATFORM_PROVISIONING_VERSION } from "./version";

export type CreatePlatformProvisioningOptions = {
  readonly governance: PlatformGovernanceService;
  readonly outboxStore?: OutboxStore;
  readonly registry?: EventRegistry;
  readonly bus?: EventBus;
  readonly store?: ProvisioningFlowStore;
  readonly audit?: ProvisioningAuditSink;
};

export type PlatformProvisioningRuntime = {
  readonly version: string;
  readonly engine: ProductProvisioningEngine;
  readonly store: ProvisioningFlowStore;
  readonly audit: ProvisioningAuditSink;
  readonly bus: EventBus;
  readonly registry: EventRegistry;
  readonly outboxStore?: OutboxStore;
  readonly publishCounters: PublishCounters;
  health(): ProvisioningHealth;
  diagnostics(): ProvisioningDiagnostics;
  createOutboxHandler(name?: string): OutboxHandler;
  createWorker(extraHandlers?: readonly OutboxHandler[]): OutboxWorker | undefined;
};

/**
 * Compose Product Provisioning runtime: governance orchestration, ENF events
 * (via platform-event-bus registry composition), optional outbox retry, audit.
 */
export function createPlatformProvisioning(
  options: CreatePlatformProvisioningOptions,
): PlatformProvisioningRuntime {
  const registry = ensureProvisioningEventRegistry(
    options.registry ?? createDefaultEventRegistry(),
  );

  const eventBusRuntime = options.bus
    ? undefined
    : createPlatformEventBus({
        registry,
        outboxStore: options.outboxStore,
        allowUnsignedIngress: true,
      });

  const bus = options.bus ?? eventBusRuntime!.bus;
  const store = options.store ?? createInMemoryProvisioningFlowStore();
  const audit = options.audit ?? createInMemoryProvisioningAuditSink();
  const publishCounters = createPublishCounters();

  const engine = createProductProvisioningEngine({
    governance: options.governance,
    bus,
    store,
    audit,
    publishCounters,
    outboxStore: options.outboxStore,
  });

  return {
    version: PLATFORM_PROVISIONING_VERSION,
    engine,
    store,
    audit,
    bus,
    registry,
    outboxStore: options.outboxStore,
    publishCounters,
    health: () => toProvisioningHealth(store),
    diagnostics: () => buildProvisioningDiagnostics({ store, audit, publishCounters }),
    createOutboxHandler: (name) => engine.createOutboxHandler(name),
    createWorker(extraHandlers = []) {
      if (!options.outboxStore) return undefined;
      return createOutboxWorker({
        store: options.outboxStore,
        handlers: [engine.createOutboxHandler("provisioning-steps"), ...extraHandlers],
      });
    },
  };
}
