export {
  createProjectsResourceService,
  getMemoryProjectsResourceStore,
  resetProjectsResourceStoreForTests,
  setProjectsResourceStoreForTests,
  resolveProjectsResourceStore,
  computeTeamHealth,
  computeDeliveryCapacity,
  computeResourceForecast,
  type ProjectsResourceService,
  type TeamSignalLoader,
  type OperationalObjectSeed,
} from "./create-projects-resource-service";
export type { ProjectsResourceStore } from "./memory-store";
export type { TeamSignalInput } from "./compute-team-signals";
