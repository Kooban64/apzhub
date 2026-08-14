"use client";

import { useSession } from "@apzhub/auth";
import type { ReactNode } from "react";

import { OperatorShell } from "@/components/operator/operator-shell";
import type { OperatorShellId } from "@/lib/operator/shell-landing";

export function OperatorShellLayout({
  shell,
  title,
  children,
}: {
  readonly shell: OperatorShellId;
  readonly title: string;
  readonly children: ReactNode;
}) {
  const { data: session } = useSession();
  return (
    <OperatorShell
      shell={shell}
      title={title}
      userName={session?.user?.name}
      userEmail={session?.user?.email}
    >
      {children}
    </OperatorShell>
  );
}
