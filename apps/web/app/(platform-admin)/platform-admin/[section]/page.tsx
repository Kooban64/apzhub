import { PlatformAdminSectionStub } from "@/components/platform-admin/platform-admin-section-stub";
import { notFound } from "next/navigation";

const TITLES: Record<string, string> = {
  tenants: "Tenants",
  subscriptions: "Subscriptions",
  marketplace: "Marketplace",
  billing: "Billing",
  products: "Products",
  provisioning: "Provisioning",
  providers: "Providers",
  configuration: "Configuration",
  operations: "Operations",
  incidents: "Incidents",
  jobs: "Jobs & Queues",
  identity: "Identity & Access",
  security: "Security",
  compliance: "Compliance",
  audit: "Audit",
  help: "Help",
  settings: "Settings",
};

export default async function PlatformAdminSectionPage({
  params,
}: {
  readonly params: Promise<{ readonly section: string }>;
}) {
  const { section } = await params;
  const title = TITLES[section];
  if (!title) notFound();
  return <PlatformAdminSectionStub title={title} />;
}
