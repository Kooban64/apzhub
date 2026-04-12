import { AdminBundleEditorPage } from "@/features/admin/access/admin-bundle-editor-page";

export default async function AdminBundleDetailRoutePage({
  params,
}: {
  params: Promise<{ bundleId: string }>;
}) {
  const { bundleId } = await params;
  return <AdminBundleEditorPage bundleId={bundleId} />;
}
