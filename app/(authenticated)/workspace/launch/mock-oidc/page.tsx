import Link from "next/link";

export default async function MockOidcLaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return (
    <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="mock-launch-oidc-page">
      <h1 className="text-lg font-semibold">OIDC launch (mock)</h1>
      <p className="text-muted-foreground">
        Phase 7 redirect-style stub for service <span className="font-mono text-foreground">{service ?? "—"}</span>. No
        real IdP round-trip.
      </p>
      <Link href="/workspace" className="text-primary underline">
        Back to workspace
      </Link>
    </div>
  );
}
