import type { Matter } from "@apzhub/legal-business-core";

import type { MatterListCriteria } from "./matter-types";
import { matchesMatterCriteria, sortMattersByTitle } from "./matter-repository-filters";
import type { WritableMatterRepository } from "./writable-matter-repository";
import { SEED_MATTERS } from "./seed-matters";

/** In-memory writable matter repository with soft archive (LAW-003-01). */
export class InMemoryMatterRepository implements WritableMatterRepository {
  private readonly matters: Map<string, Matter>;
  private readonly softArchivedIds = new Set<string>();

  constructor(seed: readonly Matter[] = SEED_MATTERS) {
    this.matters = new Map(seed.map((matter) => [matter.matterId, matter]));
  }

  list(criteria?: MatterListCriteria): readonly Matter[] {
    return sortMattersByTitle(
      [...this.matters.values()]
        .filter((matter) => !this.softArchivedIds.has(matter.matterId))
        .filter((matter) => matchesMatterCriteria(matter, criteria)),
    );
  }

  getById(matterId: string): Matter | undefined {
    if (this.softArchivedIds.has(matterId)) {
      return undefined;
    }

    return this.matters.get(matterId);
  }

  create(matter: Matter): Matter {
    this.matters.set(matter.matterId, matter);
    this.softArchivedIds.delete(matter.matterId);
    return matter;
  }

  update(matterId: string, matter: Matter): Matter | undefined {
    if (!this.matters.has(matterId) || this.softArchivedIds.has(matterId)) {
      return undefined;
    }

    this.matters.set(matterId, matter);
    return matter;
  }

  softArchive(matterId: string): Matter | undefined {
    const existing = this.matters.get(matterId);
    if (!existing || this.softArchivedIds.has(matterId)) {
      return undefined;
    }

    const archived: Matter = {
      ...existing,
      matterStatus: "archived",
      closedAt: new Date().toISOString(),
    };

    this.matters.set(matterId, archived);
    this.softArchivedIds.add(matterId);
    return archived;
  }

  count(includeArchived = false): number {
    if (includeArchived) {
      return this.matters.size;
    }

    return [...this.matters.keys()].filter(
      (matterId) => !this.softArchivedIds.has(matterId),
    ).length;
  }

  isSoftArchived(matterId: string): boolean {
    return this.softArchivedIds.has(matterId);
  }
}

export {
  getSharedMatterRepository,
  resetSharedMatterRepository,
} from "../persistence/repository-factory";
