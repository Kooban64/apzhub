import { redirect } from "next/navigation";

import { getSessionSnapshot } from "@/lib/auth/get-session-server";

export default async function Home() {
  const snap = await getSessionSnapshot();
  if (snap.sessionStatus !== "active") {
    redirect("/login");
  }
  redirect(snap.defaultLandingPath);
}
