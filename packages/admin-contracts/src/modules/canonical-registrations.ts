/**
 * Canonical administration module registrations (APZADMIN-001).
 * Metadata catalogue only — no implementations or runtime wiring.
 */

import type { AdministrationModuleKey } from "../enums/catalogue";

export type CanonicalAdministrationModuleRegistration = {
  readonly key: AdministrationModuleKey;
  readonly name: string;
  readonly description: string;
  readonly defaultStatus: "registered";
  readonly owner: string;
  readonly version: string;
};

export const CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS: readonly CanonicalAdministrationModuleRegistration[] =
  [
    {
      key: "identity",
      name: "Identity Administration",
      description: "Platform identity and authentication administration surfaces.",
      defaultStatus: "registered",
      owner: "platform-identity",
      version: "0.1.0",
    },
    {
      key: "projects",
      name: "Projects Administration",
      description: "Projects product administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-projects",
      version: "0.1.0",
    },
    {
      key: "support",
      name: "Support Administration",
      description: "Support product administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-support",
      version: "0.1.0",
    },
    {
      key: "testing",
      name: "Testing Administration",
      description: "Testing product administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-testing",
      version: "0.1.0",
    },
    {
      key: "reporting",
      name: "Reporting Administration",
      description: "Reporting product administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-reporting",
      version: "0.1.0",
    },
    {
      key: "documents",
      name: "Documents Administration",
      description: "Documents product administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-documents",
      version: "0.1.0",
    },
    {
      key: "search",
      name: "Search Administration",
      description: "Search platform administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-search",
      version: "0.1.0",
    },
    {
      key: "workflow",
      name: "Workflow Administration",
      description: "Workflow platform administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-workflow",
      version: "0.1.0",
    },
    {
      key: "workflow-engine",
      name: "Workflow Engine Administration",
      description: "Workflow engine administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-workflow-engine",
      version: "0.1.0",
    },
    {
      key: "notifications",
      name: "Notifications Administration",
      description: "Notification platform administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-notifications",
      version: "0.1.0",
    },
    {
      key: "configuration",
      name: "Configuration Administration",
      description: "Configuration platform administration registration metadata.",
      defaultStatus: "registered",
      owner: "platform-configuration",
      version: "0.1.0",
    },
    {
      key: "future",
      name: "Future Administration",
      description: "Reserved registration slot for future administration modules.",
      defaultStatus: "registered",
      owner: "platform-admin",
      version: "0.1.0",
    },
  ] as const;
