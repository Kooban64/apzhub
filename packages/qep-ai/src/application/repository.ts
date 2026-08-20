import type { AiProposalRecord } from "../domain/types";

export type AiProposalRepository = {
  save(row: AiProposalRecord): Promise<void>;
  get(tenantId: string, id: string): Promise<AiProposalRecord | undefined>;
  list(tenantId: string, applicationId: string): Promise<readonly AiProposalRecord[]>;
};
