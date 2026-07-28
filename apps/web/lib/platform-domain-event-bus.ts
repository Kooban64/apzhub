import type { EventBus } from "@apzhub/event-notification-framework";

/**
 * Process-local bridge so Platform Services (server) and Workbench shell (client)
 * can share / discover an EventBus without product-owned notify subsystems.
 * APZHUB-1.1-003
 */
let registeredBus: EventBus | undefined;

export function registerPlatformDomainEventBus(bus: EventBus): void {
  registeredBus = bus;
}

export function getPlatformDomainEventBus(): EventBus | undefined {
  return registeredBus;
}

export function clearPlatformDomainEventBus(): void {
  registeredBus = undefined;
}
