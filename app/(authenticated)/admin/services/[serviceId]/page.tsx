import { AdminServiceDetailPage } from "@/features/admin/access/admin-service-detail-page";

export default async function AdminServiceDetailRoutePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  return <AdminServiceDetailPage serviceId={serviceId} />;
}
