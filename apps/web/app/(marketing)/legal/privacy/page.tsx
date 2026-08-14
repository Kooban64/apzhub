import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="10 August 2026">
      <p>
        APZHUB processes account, organisation, billing metadata, and operational
        telemetry required to run the Platform. Business records owned by backend
        engines remain under those systems of record.
      </p>
      <h2 className="pt-2 text-base font-semibold">What we store</h2>
      <p>
        Platform PostgreSQL holds identity, sessions, permissions, subscriptions,
        product grants, preferences, audit, and derived search indexes. Payment card PAN
        is never stored by APZHUB; PayFast processes card data.
      </p>
      <h2 className="pt-2 text-base font-semibold">Sharing</h2>
      <p>
        We share data with processors necessary to operate billing, email, and hosting,
        under contractual controls. We do not sell personal data.
      </p>
      <h2 className="pt-2 text-base font-semibold">Your choices</h2>
      <p>
        Contact your organisation administrator or use the contact form to request
        access or deletion where applicable law requires.
      </p>
    </LegalPageShell>
  );
}
