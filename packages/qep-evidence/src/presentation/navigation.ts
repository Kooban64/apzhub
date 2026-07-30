import { QEP_EVIDENCE_ROUTES } from "./routes";

export const QEP_EVIDENCE_NAVIGATION = {
  id: "qep-evidence",
  label: "Evidence",
  icon: "flask-conical",
  route: QEP_EVIDENCE_ROUTES.home,
  permission: "qep.evidence.read",
  order: 90,
  children: [
    {
      id: "qep-evidence-explorer",
      label: "Explorer",
      route: QEP_EVIDENCE_ROUTES.explorer,
      permission: "qep.evidence.read",
    },
    {
      id: "qep-evidence-collections",
      label: "Collections",
      route: QEP_EVIDENCE_ROUTES.collections,
      permission: "qep.evidence.read",
    },
    {
      id: "qep-evidence-new",
      label: "Capture",
      route: QEP_EVIDENCE_ROUTES.new,
      permission: "qep.evidence.create",
    },
  ],
} as const;
