/** Platform event types — Event Bus runtime deferred to post-SPR-001. */

export interface PlatformEventEnvelope<TPayload = unknown> {
  id: string;
  type: string;
  version: string;
  timestamp: string;
  payload: TPayload;
}

export type EventManifestStub = {
  id: string;
  name: string;
  version: string;
};
