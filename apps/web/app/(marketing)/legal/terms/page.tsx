import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" updated="10 August 2026">
      <p>
        These Terms govern access to APZHUB (the “Platform”), including trials,
        subscriptions, and product entitlements. By creating an account, starting a
        trial, or using the Platform, you agree to these Terms.
      </p>
      <h2 className="pt-2 text-base font-semibold">Accounts & organisations</h2>
      <p>
        You are responsible for credentials and for activity under your organisation.
        Organisation administrators control member invites and product grants within
        subscribed products.
      </p>
      <h2 className="pt-2 text-base font-semibold">Trials & billing</h2>
      <p>
        Individual and Business plans may start with a 14-day trial that does not
        require a card. One trial is permitted per organisation. A trial does not
        automatically convert to a paid subscription — paid access begins only after an
        authoritative checkout and verified payment.
      </p>
      <h2 className="pt-2 text-base font-semibold">Acceptable use</h2>
      <p>
        You must not abuse the Platform, attempt to bypass entitlement or permission
        gates, or use the Platform to violate applicable law.
      </p>
      <h2 className="pt-2 text-base font-semibold">Contact</h2>
      <p>
        Commercial and legal inquiries: use the{" "}
        <a href="/contact" className="underline">
          contact
        </a>{" "}
        form.
      </p>
    </LegalPageShell>
  );
}
