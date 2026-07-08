export type {
  EventEnvelope,
  PlatformEventEnvelope,
  EventBus,
  EventBusPublishResult,
  EventBusPublishErrorCode,
  EventBusSubscribeOptions,
} from "./event-envelope";

export type {
  EventDescriptor,
  EventDescriptorStatus,
  EventDescriptorSource,
  EventVisibility,
  EventStability,
  EventRegistry,
  EventRegistryFactory,
} from "./event-descriptor";

export type {
  EventEntryDiagnostics,
  EventMetadata,
  EventRegistryMetadata,
  EventRegistrationIssue,
  EventRegistrationIssueCode,
} from "./event-metadata";

export type { EventBatchRegistrationResult } from "./event-batch-registration";

export {
  EventRegistryDuplicateError,
  EventRegistryNotFoundError,
  EventRegistryValidationError,
} from "./registry-errors";

export { validateEventDescriptor } from "./validate-event-descriptor";

export {
  DefaultEventRegistry,
  createDefaultEventRegistry,
  defaultEventRegistryFactory,
} from "./default-event-registry";

export {
  InProcessEventBus,
  createInProcessEventBus,
  type InProcessEventBusOptions,
} from "./in-process-event-bus";

export {
  PlaceholderEventRegistry,
  PlaceholderEventBus,
  createPlaceholderEventRegistry,
  createPlaceholderEventBus,
} from "./placeholders";

export { buildEventMetadata } from "./build-event-metadata";

export { validateEventEnvelope } from "./validate-event-envelope";
export type {
  EventEnvelopeValidationIssue,
  EventEnvelopeValidationIssueCode,
  EventEnvelopeValidationResult,
} from "./validate-event-envelope";

export { matchesEventPattern } from "./match-event-pattern";

export type { EventBusTransport, EventBusTransportStatus } from "./event-bus-transport";
