import type { PublicationAdminAuditEntry } from "../types";

export type PublicationAdminAuditStore = {
  append(
    entry: Omit<PublicationAdminAuditEntry, "id" | "createdAt"> & {
      readonly id?: string;
      readonly createdAt?: string;
    },
  ): Promise<PublicationAdminAuditEntry>;
  list(input?: {
    readonly tenantId?: string;
    readonly limit?: number;
  }): Promise<readonly PublicationAdminAuditEntry[]>;
};
