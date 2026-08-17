"use client";

import { use } from "react";

import { OrganisationAdminProductDetailView } from "@/components/organisation-admin/organisation-admin-product-detail";

export default function OrganisationAdminProductPage({
  params,
}: {
  readonly params: Promise<{ readonly suiteId: string }>;
}) {
  const { suiteId } = use(params);
  return <OrganisationAdminProductDetailView suiteId={decodeURIComponent(suiteId)} />;
}
