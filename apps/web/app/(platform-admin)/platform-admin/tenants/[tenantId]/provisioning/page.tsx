import { PlatformAdminTenantProvisioning } from "@/components/platform-admin/platform-admin-tenant-provisioning";

export default async function PlatformAdminTenantProvisioningPage({
  params,
}: {
  readonly params: Promise<{ readonly tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <PlatformAdminTenantProvisioning tenantId={decodeURIComponent(tenantId)} />;
}
