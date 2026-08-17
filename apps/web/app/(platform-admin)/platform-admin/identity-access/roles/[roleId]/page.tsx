import { PlatformAdminIdentityRoleDetail } from "@/components/platform-admin/platform-admin-identity-role";

export default async function PlatformAdminIdentityRolePage({
  params,
}: {
  readonly params: Promise<{ readonly roleId: string }>;
}) {
  const { roleId } = await params;
  return <PlatformAdminIdentityRoleDetail roleId={decodeURIComponent(roleId)} />;
}
