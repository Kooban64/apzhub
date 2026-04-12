import type { AuditAdapterContract } from "@/lib/adapters/adapter-contracts";
import { getAuditAdapterHealth } from "@/lib/adapters/audit/audit-adapter-health";
import {
  appendControlPlaneAuditEvent,
  getControlPlaneHomeDataForApi,
  getPrivilegedTracesData,
} from "@/lib/adapters/audit/control-plane-adapter";

export const auditAdapter: AuditAdapterContract = {
  getControlPlaneHomeSnapshot() {
    return getControlPlaneHomeDataForApi();
  },
  getPrivilegedTraces() {
    return getPrivilegedTracesData();
  },
  appendAuditEvent(input, meta) {
    return appendControlPlaneAuditEvent(input, meta);
  },
  getHealth: getAuditAdapterHealth,
};

export function getAuditAdapter(): AuditAdapterContract {
  return auditAdapter;
}
