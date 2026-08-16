import { redirect } from "next/navigation";

/** Stream 1 §34–36 — Settings → Products & Billing maps to billing workspace. */
export default function SettingsBillingPage() {
  redirect("/workspace/billing");
}
