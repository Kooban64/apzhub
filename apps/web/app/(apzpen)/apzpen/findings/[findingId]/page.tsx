import { ApzpenFindingDetailPage } from "@/components/apzpen/apzpen-finding-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ findingId: string }>;
}) {
  const { findingId } = await params;
  return <ApzpenFindingDetailPage findingId={findingId} />;
}
