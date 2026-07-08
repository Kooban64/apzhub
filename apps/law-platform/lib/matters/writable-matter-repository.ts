import type { Matter } from "@apzhub/legal-business-core";
import type { MatterRepository } from "@apzhub/legal-business-core";

import type { MatterListCriteria } from "./matter-types";

/** Writable in-memory matter repository — session scoped, no persistence (LAW-003-01). */
export interface WritableMatterRepository extends MatterRepository {
  list(criteria?: MatterListCriteria): readonly Matter[];
  create(matter: Matter): Matter;
  update(matterId: string, matter: Matter): Matter | undefined;
  softArchive(matterId: string): Matter | undefined;
  count(includeArchived?: boolean): number;
  isSoftArchived(matterId: string): boolean;
}
