import { PlatformAdminTenantProducts } from "@/components/platform-admin/platform-admin-tenant-products";

export default async function PlatformAdminTenantProductsPage({
  params,
}: {
  readonly params: Promise<{ readonly tenantId: string }>;
}) {
  const { tenantId } = await params;
  return <PlatformAdminTenantProducts tenantId={decodeURIComponent(tenantId)} />;
}
