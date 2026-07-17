/**
 * @apzhub/observe-persistence — Platform Observability persistence (APZOBSERVE-001).
 */

export { OBSERVE_PERSISTENCE_VERSION } from "./version";
export {
  createEmptyObserveInMemoryStores,
  createInMemoryObserveRepositories,
  type ObserveInMemoryStores,
  type InMemoryObserveRepositories,
} from "./in-memory/repositories";
export {
  createPostgresObserveRepositories,
  type PostgresObserveRepositories,
} from "./postgres/repositories";
export {
  createObservePersistence,
  createProductionObservePersistence,
  createObservePersistenceForTest,
  type ObservePersistenceBundle,
  type CreateObservePersistenceInput,
  type CreateProductionObservePersistenceInput,
  type CreateObservePersistenceForTestInput,
} from "./factories";
