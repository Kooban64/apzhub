import { describe } from "vitest";

import { InMemoryEntityMappingStore } from "./in-memory-entity-mapping-store";
import { defineEntityMappingStoreContractTests } from "./entity-mapping-store.contract";

describe("EntityMappingStore contract (in-memory)", () => {
  defineEntityMappingStoreContractTests({
    label: "in-memory",
    createStore: () => new InMemoryEntityMappingStore(),
    resetStore: (store) => {
      if (store instanceof InMemoryEntityMappingStore) {
        store.clear();
      }
    },
  });
});
