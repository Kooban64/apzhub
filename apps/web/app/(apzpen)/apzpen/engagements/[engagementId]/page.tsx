import { ApzpenEngagementDetailPage } from "@/components/apzpen/apzpen-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  return <ApzpenEngagementDetailPage engagementId={engagementId} />;
}
