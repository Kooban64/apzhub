import { PlatformAdminProductDetail } from "@/components/platform-admin/platform-admin-product-detail";

export default async function PlatformAdminProductDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly suiteId: string }>;
}) {
  const { suiteId } = await params;
  return <PlatformAdminProductDetail suiteId={decodeURIComponent(suiteId)} />;
}
