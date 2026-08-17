import { PlatformAdminProviderDetail } from "@/components/platform-admin/platform-admin-provider-detail";

export default async function PlatformAdminProviderDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly providerId: string }>;
}) {
  const { providerId } = await params;
  return <PlatformAdminProviderDetail providerId={decodeURIComponent(providerId)} />;
}
