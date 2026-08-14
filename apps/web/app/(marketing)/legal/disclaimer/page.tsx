import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export default function DisclaimerPage() {
  return (
    <LegalPageShell title="Disclaimer" updated="10 August 2026">
      <p>
        APZHUB and APZQEP provide tooling for quality engineering workflows. The
        Platform does not itself certify products, releases, or compliance outcomes.
      </p>
      <h2 className="pt-2 text-base font-semibold">Human gate</h2>
      <p>
        Certification and GO / NO-GO decisions remain human responsibilities. Automated
        packs and evidence assist operators; they do not replace professional judgment.
      </p>
      <h2 className="pt-2 text-base font-semibold">Engine accuracy</h2>
      <p>
        Upstream engines and connectors may return incomplete or delayed data. APZHUB
        translates and scopes access; it does not warrant absolute accuracy of
        third-party systems.
      </p>
      <h2 className="pt-2 text-base font-semibold">Trials</h2>
      <p>
        Trial billing converts to paid unless cancelled per Terms. Charges follow the
        catalogue amounts configured for your plan.
      </p>
    </LegalPageShell>
  );
}
