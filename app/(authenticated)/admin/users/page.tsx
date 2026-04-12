import { Suspense } from "react";

import { AdminUsersPage } from "@/features/admin/access/admin-users-page";

export default function AdminUsersRoutePage() {
  return (
    <Suspense fallback={null}>
      <AdminUsersPage />
    </Suspense>
  );
}
