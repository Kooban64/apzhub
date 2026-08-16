import { redirect } from "next/navigation";

/** Canonical user settings live under personalisation — avoid dead `/workspace/settings`. */
export default function WorkspaceSettingsRedirectPage() {
  redirect("/workspace/personalisation");
}
