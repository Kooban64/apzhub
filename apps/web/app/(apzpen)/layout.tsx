import { ApzpenLegacyClientRedirect } from "./apzpen-legacy-redirect";

/**
 * Legacy Operator `/apzpen` group — redirect into Workbench Security IA (Slice 4).
 * Pages remain briefly for SSR; client replace lands users in Workbench chrome.
 */
export default function ApzpenLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ApzpenLegacyClientRedirect />
      <div className="p-6 text-sm text-[var(--color-muted-foreground)]">
        Opening Security in Workbench…
        {children ? (
          <div className="sr-only" aria-hidden>
            {children}
          </div>
        ) : null}
      </div>
    </>
  );
}
