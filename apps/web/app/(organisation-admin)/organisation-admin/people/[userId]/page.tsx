"use client";

import { use } from "react";

import { OrganisationAdminPersonView } from "@/components/organisation-admin/organisation-admin-person";

export default function OrganisationAdminPersonPage({
  params,
}: {
  readonly params: Promise<{ readonly userId: string }>;
}) {
  const { userId } = use(params);
  return <OrganisationAdminPersonView userId={decodeURIComponent(userId)} />;
}
