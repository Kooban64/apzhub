import {
  createDefaultEventRegistry,
  createInProcessEventBus,
  type EventBus,
} from "@apzhub/event-notification-framework";
import { getDb } from "@apzhub/config/db";
import {
  createAutomationFoundation,
  createDomainEventPublisherFromBus,
  createProductionAutomationExecutionJournal,
  registerDefaultSupportAutomationRegistrations,
  wireEventAutomation,
  type AutomationFoundation,
  type DomainEventPublisher,
} from "@apzhub/platform-services";

import { registerSupportEvents } from "@/lib/register-support-events";

let serverDomainEventBus: EventBus | undefined;
let serverDomainEventPublisher: DomainEventPublisher | undefined;
let serverAutomationFoundation: AutomationFoundation | undefined;

/**
 * Server-side platform Automation Foundation (APZHUB-1.1-004 / APZHUB-ENG-0001).
 * PostgreSQL journal SoR when DATABASE_URL is set; in-memory for tests/dev without DB.
 * Created with Support default event→journal registrations.
 */
export function getOrCreateServerAutomationFoundation(): AutomationFoundation {
  if (serverAutomationFoundation) {
    return serverAutomationFoundation;
  }

  const journal = process.env.DATABASE_URL
    ? createProductionAutomationExecutionJournal({ db: getDb() })
    : undefined;

  serverAutomationFoundation = createAutomationFoundation(journal ? { journal } : {});
  registerDefaultSupportAutomationRegistrations(serverAutomationFoundation);
  return serverAutomationFoundation;
}

/**
 * Server-side platform domain Event Bus for Platform Service publish
 * (APZHUB-1.1-003) + Automation Foundation wire (APZHUB-1.1-004).
 */
export function getOrCreateServerDomainEventPublisher(): DomainEventPublisher {
  if (serverDomainEventPublisher) {
    return serverDomainEventPublisher;
  }

  const registry = createDefaultEventRegistry();
  registerSupportEvents(registry);
  serverDomainEventBus = createInProcessEventBus({ registry });
  serverDomainEventPublisher = createDomainEventPublisherFromBus(serverDomainEventBus);

  const automation = getOrCreateServerAutomationFoundation();
  wireEventAutomation(serverDomainEventBus, automation, [
    "support.*",
    "projects.*",
    "platform.*",
  ]);

  return serverDomainEventPublisher;
}

export function getServerDomainEventBus(): EventBus | undefined {
  return serverDomainEventBus;
}

/** Test helper */
export function resetServerDomainEventBusForTests(): void {
  serverDomainEventBus = undefined;
  serverDomainEventPublisher = undefined;
  serverAutomationFoundation = undefined;
}
