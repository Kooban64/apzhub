import { adminAccessDataSchema } from "@/lib/admin/access/admin-access-data-schema";
import { accessRealizationStatusSchema } from "@/lib/admin/access/realization-status";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import { getDb } from "@/db/client";
import { accessServiceRealizations } from "@/db/schema/provisioning";

/** Overlay DB-backed realization rows onto mock/file access data (directory + matrix stay from base). */
export async function mergeProvisioningRealizationOverlay(base: AdminAccessData): Promise<AdminAccessData> {
  try {
    const db = getDb();
    const rows = await db.select().from(accessServiceRealizations);
    if (rows.length === 0) {
      return base;
    }
    const out = structuredClone(base) as AdminAccessData;

    for (const row of rows) {
      const status = accessRealizationStatusSchema.parse(row.realizationStatus);
      const detail = out.userAccessByUserId[row.userId];
      if (detail) {
        detail.serviceAccess = detail.serviceAccess.map((line) => {
          if (line.serviceId !== row.serviceId) {
            return line;
          }
          return {
            ...line,
            realizationStatus: status,
            activeJobId: row.activeJobId ?? undefined,
            lastJobSummary: row.lastJobSummary ?? line.lastJobSummary,
          };
        });
      }

      out.matrix.cells = out.matrix.cells.map((cell) => {
        if (cell.userId !== row.userId || cell.serviceId !== row.serviceId) {
          return cell;
        }
        return {
          ...cell,
          realizationStatus: status,
          activeJobId: row.activeJobId ?? undefined,
        };
      });
    }

    return adminAccessDataSchema.parse(out) as AdminAccessData;
  } catch {
    return base;
  }
}
