import type { ScmProviderId } from "./repository";

/** Past-tense provider-neutral SCM domain events. */
export const SCM_EVENT_TYPES = {
  repositoryRegistered: "platform.scm.repository.registered",
  repositoryUpdated: "platform.scm.repository.updated",
  commitReceived: "platform.scm.commit.received",
  pullRequestOpened: "platform.scm.pull_request.opened",
  pullRequestUpdated: "platform.scm.pull_request.updated",
  pullRequestClosed: "platform.scm.pull_request.closed",
  branchCreated: "platform.scm.branch.created",
  branchDeleted: "platform.scm.branch.deleted",
  tagCreated: "platform.scm.tag.created",
  releasePublished: "platform.scm.release.published",
  providerConnected: "platform.scm.provider.connected",
  providerDisconnected: "platform.scm.provider.disconnected",
  providerRegistered: "platform.scm.provider.registered",
  webhookFailed: "platform.scm.webhook.failed",
  authenticationFailed: "platform.scm.authentication.failed",
  webhookReceived: "platform.scm.webhook.received",
} as const;

export type ScmEventType = (typeof SCM_EVENT_TYPES)[keyof typeof SCM_EVENT_TYPES];

export interface ScmDomainEvent {
  readonly type: ScmEventType;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly providerId: ScmProviderId;
  readonly repositoryId?: string;
  readonly payload?: Readonly<Record<string, string | number | boolean>>;
}

export type ScmEventPublisher = (event: ScmDomainEvent) => void | Promise<void>;
