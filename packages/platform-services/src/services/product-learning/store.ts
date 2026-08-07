import type {
  ProductLearningEvent,
  ProductLearningFeatureKey,
} from "@apzhub/platform-service-contracts";

export interface ProductLearningEventStore {
  append(event: ProductLearningEvent): Promise<void>;
  listByFeature(
    tenantId: string,
    featureKey: ProductLearningFeatureKey,
  ): Promise<readonly ProductLearningEvent[]>;
  clearForTests?(): Promise<void>;
}
