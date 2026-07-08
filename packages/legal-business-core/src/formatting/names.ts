/** Formats a person display name from given and family names. */
export function formatPersonName(
  givenName: string,
  familyName: string,
  title?: string,
): string {
  const base = `${givenName.trim()} ${familyName.trim()}`.trim();
  return title ? `${title.trim()} ${base}`.trim() : base;
}

/** Formats a client display name per domain model §4.3. */
export function formatClientDisplayName(options: {
  readonly organisationLegalName?: string;
  readonly contactDisplayName?: string;
  readonly fallback?: string;
}): string {
  return (
    options.organisationLegalName?.trim() ||
    options.contactDisplayName?.trim() ||
    options.fallback?.trim() ||
    "Unnamed Client"
  );
}

/** Formats a matter list label per domain model §4.3. */
export function formatMatterListLabel(matterReference: string, title: string): string {
  return `${matterReference} — ${title.trim()}`;
}

/** Formats a document title with optional version suffix. */
export function formatDocumentTitle(title: string, version?: number): string {
  return version && version > 1 ? `${title.trim()} (v${version})` : title.trim();
}
