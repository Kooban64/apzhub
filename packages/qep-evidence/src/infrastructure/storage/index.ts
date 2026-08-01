/**
 * Evidence content storage — APZQEP-120-S03 Storage Platform + ENG-110C skeleton.
 */

export {
  STORAGE_ADAPTER_SCAFFOLD,
  StoragePortAdapterSkeleton,
  type StorageAdapterScaffold,
  type StorageAdapterScaffoldId,
} from "./storage-port-adapter";

export * from "./platform/index";
export { createLocalEvidenceStorageProvider } from "./providers/local/local-evidence-storage-provider";
export { createMemoryEvidenceStorageProvider } from "./providers/memory/memory-evidence-storage-provider";
