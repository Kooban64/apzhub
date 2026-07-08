import { Card, CardContent, CardHeader, CardTitle } from "@apzhub/ui";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-[var(--color-muted-foreground)]">
          <p>
            Password reset is scaffolded for SPR-001. In development, reset links are
            logged to the server console.
          </p>
          <Link href="/login" className="text-[var(--color-primary)] hover:underline">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
