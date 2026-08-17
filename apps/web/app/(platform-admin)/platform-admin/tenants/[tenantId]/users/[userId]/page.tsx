import { PlatformAdminUserInspector } from "@/components/platform-admin/platform-admin-user-inspector";

export default async function PlatformAdminUserInspectorPage({
  params,
}: {
  readonly params: Promise<{ readonly tenantId: string; readonly userId: string }>;
}) {
  const { tenantId, userId } = await params;
  return (
    <PlatformAdminUserInspector
      tenantId={decodeURIComponent(tenantId)}
      userId={decodeURIComponent(userId)}
    />
  );
}
