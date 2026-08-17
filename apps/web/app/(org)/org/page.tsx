import { redirect } from "next/navigation";

import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";

/** Legacy `/org` → Organisation Admin Home. */
export default function OrgRedirectPage() {
  redirect(ORGANISATION_ADMIN_BASE);
}
