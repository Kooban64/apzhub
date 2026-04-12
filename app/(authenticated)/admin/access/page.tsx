import { Suspense } from "react";

import { AdminMatrixPage } from "@/features/admin/access/admin-matrix-page";

export default function AdminAccessRoutePage() {
  return (
    <Suspense fallback={null}>
      <AdminMatrixPage />
    </Suspense>
  );
}
