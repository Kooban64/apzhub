import Link from "next/link";

export default async function MockExternalLaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return (
    <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="mock-launch-external-page">
      <h1 className="text-lg font-semibold">External launch (mock)</h1>
      <p className="text-muted-foreground">
        Would open a vendor shell for <span className="font-mono text-foreground">{service ?? "—"}</span> in a new
        browsing context. Phase 7 keeps navigation in-app.
      </p>
      <Link href="/workspace" className="text-primary underline">
        Back to workspace
      </Link>
    </div>
  );
}
