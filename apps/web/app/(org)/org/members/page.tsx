import { redirect } from "next/navigation";

import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";

/** Legacy `/org/members` → Organisation Admin People. */
export default function OrgMembersRedirectPage() {
  redirect(`${ORGANISATION_ADMIN_BASE}/people`);
}
