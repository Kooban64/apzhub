import { ApzpenFindingDetailPage } from "@/components/apzpen/apzpen-finding-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ findingId: string }>;
}) {
  const { findingId } = await params;
  return <ApzpenFindingDetailPage findingId={findingId} />;
}
