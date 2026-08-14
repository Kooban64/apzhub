import { LegalPageShell } from "@/components/marketing/legal-page-shell";

export default function CookiesPage() {
  return (
    <LegalPageShell title="Cookie Policy" updated="10 August 2026">
      <p>
        APZHUB uses essential cookies and similar storage for authentication sessions,
        CSRF protection, theme preference, and cookie-notice dismissal.
      </p>
      <h2 className="pt-2 text-base font-semibold">Essential</h2>
      <p>
        Session cookies are required to keep you signed in. Without them, protected
        workspace routes cannot function.
      </p>
      <h2 className="pt-2 text-base font-semibold">Preferences</h2>
      <p>
        Theme (light/dark/system) and cookie-notice dismissal may be stored in local
        browser storage. These are not used for advertising.
      </p>
      <h2 className="pt-2 text-base font-semibold">Analytics</h2>
      <p>
        Product analytics, if enabled by your organisation, follow Platform
        Observability standards and remain self-hosted first.
      </p>
    </LegalPageShell>
  );
}
