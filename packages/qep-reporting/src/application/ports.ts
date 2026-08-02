/**
 * Quality facts port — Cap F reads derived facts; never mutates Cap A–E SoRs.
 */

import type { QualityFacts } from "../domain/types";

export type QualityFactsPort = {
  collect(input: {
    readonly tenantId: string;
    readonly projectId?: string;
    readonly now: string;
  }): Promise<QualityFacts>;
};
