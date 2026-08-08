import { QUICK_ACTION_HREFS } from "./deep-links";
import type { QuickActionDescriptor } from "./types";

/** Frozen Global Quick Actions v1 catalogue (Owner inventory). */
export const GLOBAL_QUICK_ACTIONS: readonly QuickActionDescriptor[] = [
  {
    id: "qa-new-project",
    label: "New Project",
    description: "Create a project in Projects",
    productId: "projects",
    productLabel: "Projects",
    href: QUICK_ACTION_HREFS["qa-new-project"],
    permission: "projects.manage",
  },
  {
    id: "qa-new-ticket",
    label: "New Ticket",
    description: "Open a support request",
    productId: "support",
    productLabel: "Support",
    href: QUICK_ACTION_HREFS["qa-new-ticket"],
    permission: "support.requests.create",
  },
  {
    id: "qa-log-time",
    label: "Log Time",
    description: "Create a timesheet entry",
    productId: "time",
    productLabel: "Time",
    href: QUICK_ACTION_HREFS["qa-log-time"],
    permission: "time.timesheet.create",
  },
  {
    id: "qa-start-workflow",
    label: "Start Workflow",
    description: "Open Workflow to start work",
    productId: "workflow",
    productLabel: "Workflow",
    href: QUICK_ACTION_HREFS["qa-start-workflow"],
    permission: "workflow.create",
  },
  {
    id: "qa-upload-document",
    label: "Upload Document",
    description: "Open Documents workspace",
    productId: "documents",
    productLabel: "Documents",
    href: QUICK_ACTION_HREFS["qa-upload-document"],
    permission: "document.write",
  },
  {
    id: "qa-create-knowledge",
    label: "Create Knowledge Article",
    description: "Open Knowledge library",
    productId: "knowledge",
    productLabel: "Knowledge",
    href: QUICK_ACTION_HREFS["qa-create-knowledge"],
    permission: "knowledge.view",
  },
  {
    id: "qa-run-test",
    label: "Run Test",
    description: "Create a QEP test plan",
    productId: "qep",
    productLabel: "QEP",
    href: QUICK_ACTION_HREFS["qa-run-test"],
    permission: "qep.plan.create",
  },
] as const;

export function listGlobalQuickActionDescriptors(): readonly QuickActionDescriptor[] {
  return GLOBAL_QUICK_ACTIONS;
}
