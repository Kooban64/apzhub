import { PlatformAdminTenantUsers } from "@/components/platform-admin/platform-admin-tenant-users";

export default async function PlatformAdminTenantUsersPage({
  params,
}: {
  readonly params: Promise<{ readonly tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <PlatformAdminTenantUsers tenantId={decodeURIComponent(tenantId)} />;
}
