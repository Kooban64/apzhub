import Link from "next/link";

export default async function MockVaultLaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; delegationRequestId?: string }>;
}) {
  const { service, delegationRequestId } = await searchParams;
  return (
    <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="mock-launch-vault-page">
      <h1 className="text-lg font-semibold">Vault-delegated launch (mock)</h1>
      <p className="text-muted-foreground">
        Controlled delegation handle <span className="font-mono text-foreground">{delegationRequestId ?? "—"}</span>{" "}
        for service <span className="font-mono text-foreground">{service ?? "—"}</span>. No secrets are shown here.
      </p>
      <Link href="/workspace" className="text-primary underline">
        Back to workspace
      </Link>
    </div>
  );
}
