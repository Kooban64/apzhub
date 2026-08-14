"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { Button, Input } from "@apzhub/ui";

const INTENT_LABELS: Record<string, string> = {
  qa: "APZQA / Quality",
  pentest: "APZPenTest / Security",
  productivity: "Productivity Suite waitlist",
  "security-assessment": "Security assessment",
};

function ContactForm() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent")?.trim() || "";
  const intentLabel = INTENT_LABELS[intent];

  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const title = useMemo(() => {
    if (intentLabel) return `Contact — ${intentLabel}`;
    return "Contact / Get a quote";
  }, [intentLabel]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-[var(--color-muted-foreground)]">
        Tell us about your organisation. Custom plans, QA programmes, pen-test scopes,
        and the Productivity Suite waitlist all start here.
      </p>
      {sent ? (
        <p className="mt-8 text-sm" role="status">
          Thanks — your inquiry was recorded for this environment. We will follow up at{" "}
          {email || "your email"}.{" "}
          <Link href="/" className="underline">
            Back to home
          </Link>
        </p>
      ) : (
        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          {intent ? <input type="hidden" name="intent" value={intent} /> : null}
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Work email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="flex flex-col gap-1 text-sm">
            <span>Message</span>
            <textarea
              name="message"
              className="min-h-28 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </label>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            By submitting you agree to our{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
          <Button type="submit">Send inquiry</Button>
        </form>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading…</div>}>
      <ContactForm />
    </Suspense>
  );
}
