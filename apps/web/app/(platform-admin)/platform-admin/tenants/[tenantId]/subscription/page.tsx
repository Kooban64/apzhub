import { PlatformAdminTenantSubscription } from "@/components/platform-admin/platform-admin-tenant-subscription";

export default async function PlatformAdminTenantSubscriptionPage({
  params,
}: {
  readonly params: Promise<{ readonly tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <PlatformAdminTenantSubscription tenantId={decodeURIComponent(tenantId)} />;
}
