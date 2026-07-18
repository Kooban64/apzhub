/**
 * @apzhub/metrics-persistence — Platform Metrics persistence (APZMETRICS-001).
 */

export { METRICS_PERSISTENCE_VERSION } from "./version";
export {
  createEmptyMetricsInMemoryStores,
  createInMemoryMetricsRepositories,
  type MetricsInMemoryStores,
  type InMemoryMetricsRepositories,
} from "./in-memory/repositories";
export {
  createPostgresMetricsRepositories,
  type PostgresMetricsRepositories,
} from "./postgres/repositories";
export {
  createMetricsPersistence,
  createProductionMetricsPersistence,
  createMetricsPersistenceForTest,
  type MetricsPersistenceBundle,
  type CreateMetricsPersistenceInput,
  type CreateProductionMetricsPersistenceInput,
  type CreateMetricsPersistenceForTestInput,
} from "./factories";
