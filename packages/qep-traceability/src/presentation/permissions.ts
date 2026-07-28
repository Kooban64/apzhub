import {
  QEP_TRACEABILITY_PERMISSIONS,
  type QepTraceabilityPermission,
} from "@apzhub/qep-contracts";

export { QEP_TRACEABILITY_PERMISSIONS, type QepTraceabilityPermission };

export const QEP_TRACEABILITY_PERMISSION_LABELS: Readonly<
  Record<QepTraceabilityPermission, string>
> = {
  "qep.traceability.trace_links.view": "View Trace Links",
  "qep.traceability.trace_links.create": "Create Trace Links",
  "qep.traceability.trace_links.modify": "Modify Trace Links",
  "qep.traceability.trace_links.validate": "Validate Trace Links",
  "qep.traceability.trace_links.approve": "Approve Trace Links",
  "qep.traceability.trace_links.retire": "Retire Trace Links",
  "qep.traceability.trace_links.supersede": "Supersede Trace Links",
  "qep.traceability.trace_links.history.view": "View Trace Link History",
  "qep.traceability.taxonomy.view": "View Trace Taxonomy",
  "qep.traceability.taxonomy.administer": "Administer Trace Taxonomy",
};
