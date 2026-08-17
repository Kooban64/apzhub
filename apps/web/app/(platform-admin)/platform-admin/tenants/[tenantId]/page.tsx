import { PlatformAdminTenantOverview } from "@/components/platform-admin/platform-admin-tenant-overview";

export default async function PlatformAdminTenantPage({
  params,
}: {
  readonly params: Promise<{ readonly tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <PlatformAdminTenantOverview tenantId={decodeURIComponent(tenantId)} />;
}
