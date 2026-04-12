import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MainCanvas({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={cn(
        "min-h-0 min-w-0 flex-1 overflow-auto bg-background p-[var(--shell-pad)]",
        className,
      )}
      data-testid="main-canvas"
    >
      {children}
    </main>
  );
}
