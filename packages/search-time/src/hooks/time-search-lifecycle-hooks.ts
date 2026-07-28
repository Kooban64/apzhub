/**
 * Synchronous publication hooks for Time lifecycle events (R12-SEARCH-01).
 * No listeners, webhooks, polling, or Event Bus — call sites invoke explicitly.
 */

import type {
  TimeActivity,
  TimeCustomer,
  TimeProject,
  TimeTag,
  Timesheet,
} from "@apzhub/platform-service-contracts";
import type { SearchPublicationResult } from "@apzhub/search-integration";

import type { TimeSearchPublicationContext } from "../context/time-search-publication-context";
import type { TimeSearchPublisher } from "../publisher/time-search-publisher";

export type TimeSearchLifecycleHooks = {
  onTimeEntryUpserted(
    context: TimeSearchPublicationContext,
    entry: Timesheet,
  ): SearchPublicationResult;
  onTimeEntryRemoved(
    context: TimeSearchPublicationContext,
    entryId: string,
  ): SearchPublicationResult;
  onTimeActivityUpserted(
    context: TimeSearchPublicationContext,
    activity: TimeActivity,
  ): SearchPublicationResult;
  onTimeActivityRemoved(
    context: TimeSearchPublicationContext,
    activityId: string,
  ): SearchPublicationResult;
  onTimeCustomerUpserted(
    context: TimeSearchPublicationContext,
    customer: TimeCustomer,
  ): SearchPublicationResult;
  onTimeCustomerRemoved(
    context: TimeSearchPublicationContext,
    customerId: string,
  ): SearchPublicationResult;
  onTimeProjectUpserted(
    context: TimeSearchPublicationContext,
    project: TimeProject,
  ): SearchPublicationResult;
  onTimeProjectRemoved(
    context: TimeSearchPublicationContext,
    projectId: string,
  ): SearchPublicationResult;
  onTimeTagUpserted(
    context: TimeSearchPublicationContext,
    tag: TimeTag,
  ): SearchPublicationResult;
  onTimeTagRemoved(
    context: TimeSearchPublicationContext,
    tagId: string,
  ): SearchPublicationResult;
  /** Shorter aliases */
  onEntryUpserted(
    context: TimeSearchPublicationContext,
    entry: Timesheet,
  ): SearchPublicationResult;
  onEntryRemoved(
    context: TimeSearchPublicationContext,
    entryId: string,
  ): SearchPublicationResult;
  onActivityUpserted(
    context: TimeSearchPublicationContext,
    activity: TimeActivity,
  ): SearchPublicationResult;
  onActivityRemoved(
    context: TimeSearchPublicationContext,
    activityId: string,
  ): SearchPublicationResult;
  onCustomerUpserted(
    context: TimeSearchPublicationContext,
    customer: TimeCustomer,
  ): SearchPublicationResult;
  onCustomerRemoved(
    context: TimeSearchPublicationContext,
    customerId: string,
  ): SearchPublicationResult;
  onProjectUpserted(
    context: TimeSearchPublicationContext,
    project: TimeProject,
  ): SearchPublicationResult;
  onProjectRemoved(
    context: TimeSearchPublicationContext,
    projectId: string,
  ): SearchPublicationResult;
  onTagUpserted(
    context: TimeSearchPublicationContext,
    tag: TimeTag,
  ): SearchPublicationResult;
  onTagRemoved(
    context: TimeSearchPublicationContext,
    tagId: string,
  ): SearchPublicationResult;
};

/**
 * Creates explicit hooks that call publish-or-update based on existence in the sink.
 * No background subscription.
 */
export function createTimeSearchLifecycleHooks(
  publisher: TimeSearchPublisher,
): TimeSearchLifecycleHooks {
  const upsert = (
    context: TimeSearchPublicationContext,
    input: Parameters<TimeSearchPublisher["publish"]>[1],
  ): SearchPublicationResult => {
    const entityId = (input.entity as { id: string }).id;
    const prior = publisher.getIntegrationPublisher().getSink().get(entityId);
    if (prior && prior.lifecycleState !== "removed") {
      return publisher.update(context, input);
    }
    return publisher.publish(context, input);
  };

  const onTimeEntryUpserted = (c: TimeSearchPublicationContext, e: Timesheet) =>
    upsert(c, { entityType: "time_entry", entity: e });
  const onTimeEntryRemoved = (c: TimeSearchPublicationContext, id: string) =>
    publisher.remove(c, "time_entry", id);
  const onTimeActivityUpserted = (c: TimeSearchPublicationContext, e: TimeActivity) =>
    upsert(c, { entityType: "time_activity", entity: e });
  const onTimeActivityRemoved = (c: TimeSearchPublicationContext, id: string) =>
    publisher.remove(c, "time_activity", id);
  const onTimeCustomerUpserted = (c: TimeSearchPublicationContext, e: TimeCustomer) =>
    upsert(c, { entityType: "time_customer", entity: e });
  const onTimeCustomerRemoved = (c: TimeSearchPublicationContext, id: string) =>
    publisher.remove(c, "time_customer", id);
  const onTimeProjectUpserted = (c: TimeSearchPublicationContext, e: TimeProject) =>
    upsert(c, { entityType: "time_project", entity: e });
  const onTimeProjectRemoved = (c: TimeSearchPublicationContext, id: string) =>
    publisher.remove(c, "time_project", id);
  const onTimeTagUpserted = (c: TimeSearchPublicationContext, e: TimeTag) =>
    upsert(c, { entityType: "time_tag", entity: e });
  const onTimeTagRemoved = (c: TimeSearchPublicationContext, id: string) =>
    publisher.remove(c, "time_tag", id);

  return {
    onTimeEntryUpserted,
    onTimeEntryRemoved,
    onTimeActivityUpserted,
    onTimeActivityRemoved,
    onTimeCustomerUpserted,
    onTimeCustomerRemoved,
    onTimeProjectUpserted,
    onTimeProjectRemoved,
    onTimeTagUpserted,
    onTimeTagRemoved,
    onEntryUpserted: onTimeEntryUpserted,
    onEntryRemoved: onTimeEntryRemoved,
    onActivityUpserted: onTimeActivityUpserted,
    onActivityRemoved: onTimeActivityRemoved,
    onCustomerUpserted: onTimeCustomerUpserted,
    onCustomerRemoved: onTimeCustomerRemoved,
    onProjectUpserted: onTimeProjectUpserted,
    onProjectRemoved: onTimeProjectRemoved,
    onTagUpserted: onTimeTagUpserted,
    onTagRemoved: onTimeTagRemoved,
  };
}
