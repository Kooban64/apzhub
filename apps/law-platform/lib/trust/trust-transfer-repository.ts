import type {
  TrustTransfer,
  TrustTransferHistoryCriteria,
} from "./trust-transfer-types";

/** Trust transfer repository — append-only immutable transfers (LAW-015-07). */
export interface TrustTransferRepository {
  save(transfer: TrustTransfer): TrustTransfer;
  getById(tenantId: string, trustTransferId: string): TrustTransfer | undefined;
  list(criteria: TrustTransferHistoryCriteria): readonly TrustTransfer[];
}
