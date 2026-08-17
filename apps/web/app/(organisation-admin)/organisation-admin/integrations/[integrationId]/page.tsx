"use client";

import { use } from "react";

import { OrganisationAdminIntegrationDetailView } from "@/components/organisation-admin/organisation-admin-integration-detail";

export default function OrganisationAdminIntegrationDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly integrationId: string }>;
}) {
  const { integrationId } = use(params);
  return <OrganisationAdminIntegrationDetailView integrationId={integrationId} />;
}
