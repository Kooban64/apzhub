export function OrganisationAdminSectionStub({ title }: { readonly title: string }) {
  return (
    <div
      className="flex flex-col gap-3 p-4"
      data-testid="organisation-admin-section-stub"
    >
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="rounded border border-[var(--color-border)] px-3 py-3 text-xs">
        <p className="font-medium">Not configured</p>
        <p className="mt-1 text-[var(--color-muted-foreground)]">
          This Organisation Admin section is reserved for a later slice. Home, People,
          Teams, Roles & Access, Products and Provisioning are available now.
        </p>
      </div>
    </div>
  );
}
