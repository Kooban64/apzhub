"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminQuickAction } from "@/lib/admin/contracts/quick-actions";

export function AdminQuickActionsModule({ actions }: { actions: AdminQuickAction[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const inner = (
          <span className="text-xs font-medium">{a.label}</span>
        );
        if (a.disabled) {
          return (
            <Button
              key={a.id}
              type="button"
              size="sm"
              variant="outline"
              disabled
              title={a.disabledReason}
              data-testid={`admin-quick-action-${a.id}`}
              className="h-8"
            >
              {inner}
            </Button>
          );
        }
        if (a.href) {
          const isMail = a.href.startsWith("mailto:");
          if (isMail) {
            return (
              <a
                key={a.id}
                href={a.href}
                data-testid={`admin-quick-action-${a.id}`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8")}
              >
                {inner}
              </a>
            );
          }
          return (
            <Link
              key={a.id}
              href={a.href}
              data-testid={`admin-quick-action-${a.id}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-8")}
            >
              {inner}
            </Link>
          );
        }
        return (
          <Button key={a.id} type="button" size="sm" variant="secondary" className="h-8" data-testid={`admin-quick-action-${a.id}`}>
            {inner}
          </Button>
        );
      })}
    </div>
  );
}
