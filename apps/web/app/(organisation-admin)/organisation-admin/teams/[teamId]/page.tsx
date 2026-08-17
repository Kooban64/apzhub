"use client";

import { use } from "react";

import { OrganisationAdminTeamDetailView } from "@/components/organisation-admin/organisation-admin-team-detail";

export default function OrganisationAdminTeamPage({
  params,
}: {
  readonly params: Promise<{ readonly teamId: string }>;
}) {
  const { teamId } = use(params);
  return <OrganisationAdminTeamDetailView teamId={decodeURIComponent(teamId)} />;
}
