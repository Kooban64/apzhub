"use client";

/**
 * W009 / PX-06 — universal productivity chrome on every Projects screen.
 * Institutional Quick Action · shortcut help · keyboard productivity.
 * Not a consumer FAB.
 */

import { Button } from "@apzhub/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { listProductivityShortcuts } from "@/lib/projects/projects-api";
import {
  PROJECTS_BASE,
  projectCreatePath,
  projectsSearchPath,
  reviewsCalendarPath,
} from "@/lib/projects/routes";

const QUICK_ACTIONS = [
  { id: "project", label: "Project", href: () => projectCreatePath() },
  {
    id: "commitment",
    label: "Commitment",
    href: (ctx: string | null) =>
      ctx
        ? `${PROJECTS_BASE}/${ctx}?intent=delivery&action=commitment`
        : `${PROJECTS_BASE}`,
  },
  {
    id: "milestone",
    label: "Milestone",
    href: (ctx: string | null) =>
      ctx
        ? `${PROJECTS_BASE}/${ctx}?intent=planning&action=milestone`
        : `${PROJECTS_BASE}`,
  },
  {
    id: "decision",
    label: "Decision",
    href: (ctx: string | null) =>
      ctx
        ? `${PROJECTS_BASE}/${ctx}?intent=control&action=decision`
        : `${PROJECTS_BASE}`,
  },
  {
    id: "risk",
    label: "Risk",
    href: (ctx: string | null) =>
      ctx ? `${PROJECTS_BASE}/${ctx}?intent=control&action=risk` : `${PROJECTS_BASE}`,
  },
  {
    id: "exception",
    label: "Exception",
    href: (ctx: string | null) =>
      ctx
        ? `${PROJECTS_BASE}/${ctx}?intent=control&action=exception`
        : `${PROJECTS_BASE}`,
  },
  { id: "review", label: "Review", href: () => reviewsCalendarPath() },
  {
    id: "note",
    label: "Note",
    href: (ctx: string | null) =>
      ctx ? `${PROJECTS_BASE}/${ctx}?intent=history&action=note` : `${PROJECTS_BASE}`,
  },
] as const;

function resolveProjectContext(pathname: string): string | null {
  const match = pathname.match(new RegExp(`^${PROJECTS_BASE}/([^/]+)`));
  if (!match?.[1]) return null;
  const segment = match[1];
  const reserved = new Set([
    "list",
    "new",
    "create",
    "my-work",
    "tasks",
    "backlog",
    "sprints",
    "roadmap",
    "search",
    "health",
    "help",
    "settings",
    "portfolio",
    "teams",
    "admin",
    "reviews",
    "reports",
    "productivity",
  ]);
  return reserved.has(segment) ? null : segment;
}

export function ProjectsProductivityChrome() {
  const router = useRouter();
  const pathname = usePathname() ?? PROJECTS_BASE;
  const projectId = resolveProjectContext(pathname);
  const [quickOpen, setQuickOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<
    readonly { keys: string; action: string; context?: string }[]
  >([]);
  const [gPending, setGPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void listProductivityShortcuts()
      .then((items) => {
        if (cancelled) return;
        setShortcuts(
          items.map((item) => ({
            keys: String(item.keys ?? ""),
            action: String(item.action ?? ""),
            context: item.context !== undefined ? String(item.context) : undefined,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setShortcuts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }

      if (event.key === "?" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setHelpOpen((open) => !open);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "." && !event.shiftKey) {
        event.preventDefault();
        setQuickOpen((open) => !open);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push(projectsSearchPath());
        return;
      }

      if (event.key === "/" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        router.push(projectsSearchPath());
        return;
      }

      if (gPending) {
        setGPending(false);
        if (event.key === "h") {
          event.preventDefault();
          router.push(PROJECTS_BASE);
          return;
        }
        if (event.key === "o") {
          event.preventDefault();
          router.push(`${PROJECTS_BASE}/portfolio`);
          return;
        }
        if (event.key === "q") {
          event.preventDefault();
          router.push(`${PROJECTS_BASE}?focus=queue`);
          return;
        }
      }

      if (event.key === "g" && !event.ctrlKey && !event.metaKey) {
        setGPending(true);
        window.setTimeout(() => setGPending(false), 1200);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gPending, router]);

  return (
    <div data-testid="projects-productivity-chrome">
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {quickOpen ? (
          <div
            className="w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 shadow-lg"
            data-testid="projects-quick-action-menu"
            role="dialog"
            aria-label="Quick Action"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
              Quick Action
            </p>
            <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
              {projectId
                ? `Context: current project`
                : "Select a project for scoped creates"}
            </p>
            <ul className="flex flex-col gap-1">
              {QUICK_ACTIONS.map((action) => (
                <li key={action.id}>
                  <button
                    type="button"
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--color-muted)]/30"
                    data-testid={`projects-quick-action-${action.id}`}
                    onClick={() => {
                      setQuickOpen(false);
                      router.push(action.href(projectId));
                    }}
                  >
                    {action.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-testid="projects-quick-action-trigger"
          aria-expanded={quickOpen}
          aria-haspopup="dialog"
          onClick={() => setQuickOpen((open) => !open)}
        >
          Quick Action
        </Button>
      </div>

      {helpOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          data-testid="projects-shortcut-help"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Keyboard shortcuts</h2>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setHelpOpen(false)}
              >
                Close
              </Button>
            </div>
            <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
              Enterprise productivity aids — press ? anytime in APZ Projects.
            </p>
            <ul className="divide-y divide-[var(--color-border)]">
              {(shortcuts.length > 0
                ? shortcuts
                : [
                    { keys: "Ctrl+Shift+P", action: "Command Palette" },
                    { keys: "Ctrl+K", action: "Search" },
                    { keys: "Ctrl+.", action: "Quick Action" },
                    { keys: "?", action: "Shortcut help" },
                  ]
              ).map((row) => (
                <li
                  key={`${row.keys}-${row.action}`}
                  className="flex items-start justify-between gap-3 py-2 text-sm"
                >
                  <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-xs">
                    {row.keys}
                  </kbd>
                  <span className="flex-1 text-right text-[var(--color-foreground)]">
                    {row.action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
