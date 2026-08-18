import { notFound } from "next/navigation";

import { PlatformAdminAuditView } from "@/components/platform-admin/platform-admin-audit";
import { PlatformAdminIdentityAccessView } from "@/components/platform-admin/platform-admin-identity-access";
import { PlatformAdminOperationsView } from "@/components/platform-admin/platform-admin-operations";
import { PlatformAdminProductsView } from "@/components/platform-admin/platform-admin-products";
import { PlatformAdminProvidersView } from "@/components/platform-admin/platform-admin-providers";
import { PlatformAdminProvisioningView } from "@/components/platform-admin/platform-admin-provisioning";
import { PlatformAdminSectionStub } from "@/components/platform-admin/platform-admin-section-stub";
import { PlatformAdminSecurityView } from "@/components/platform-admin/platform-admin-security";
import { PlatformAdminTenantsView } from "@/components/platform-admin/platform-admin-tenants";

const STUB_TITLES: Record<string, string> = {
  subscriptions: "Subscriptions",
  marketplace: "Marketplace",
  configuration: "Configuration",
  incidents: "Incidents",
  jobs: "Jobs & Queues",
  identity: "Identity & Access",
  compliance: "Compliance",
  help: "Help",
  settings: "Settings",
};

export default async function PlatformAdminSectionPage({
  params,
}: {
  readonly params: Promise<{ readonly section: string }>;
}) {
  const { section } = await params;

  switch (section) {
    case "tenants":
      return <PlatformAdminTenantsView />;
    case "products":
      return <PlatformAdminProductsView />;
    case "provisioning":
      return <PlatformAdminProvisioningView />;
    case "providers":
      return <PlatformAdminProvidersView />;
    case "operations":
      return <PlatformAdminOperationsView />;
    case "identity-access":
      return <PlatformAdminIdentityAccessView />;
    case "security":
      return <PlatformAdminSecurityView />;
    case "audit":
      return <PlatformAdminAuditView />;
    default: {
      const title = STUB_TITLES[section];
      if (!title) notFound();
      return <PlatformAdminSectionStub title={title} />;
    }
  }
}
