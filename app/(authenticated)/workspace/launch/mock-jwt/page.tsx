import Link from "next/link";

export default async function MockJwtLaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return (
    <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="mock-launch-jwt-page">
      <h1 className="text-lg font-semibold">Internal JWT launch (mock)</h1>
      <p className="text-muted-foreground">
        Would mint or refresh an app session for <span className="font-mono text-foreground">{service ?? "—"}</span>{" "}
        without exposing tokens in the UI.
      </p>
      <Link href="/workspace" className="text-primary underline">
        Back to workspace
      </Link>
    </div>
  );
}
