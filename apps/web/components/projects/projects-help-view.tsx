"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  projectCreatePath,
  projectsDashboardPath,
  projectsHelpPath,
  projectsListPath,
  projectsSettingsPath,
} from "@/lib/projects/routes";

import { PageShell } from "./projects-ui";

/**
 * Native APZHUB help for APZ Projects — no engine documentation links.
 */
export function ProjectsHelpView() {
  const router = useRouter();

  return (
    <PageShell
      title="Help"
      description="Getting started with APZ Projects inside APZHUB."
      breadcrumbs={["APZ Projects", "Help"]}
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="projects-help">
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Getting started</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>Open Dashboard or All Projects from the APZ Projects sidebar.</li>
            <li>Create a project when you need a place to plan and track delivery.</li>
            <li>Use Tasks, Backlog, and Sprints to organise work for a project.</li>
            <li>Open My Work to focus on items assigned to you.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(projectCreatePath())}
              data-testid="projects-help-create"
            >
              New project
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(projectsListPath())}
            >
              View projects
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Where things live</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            <li>
              <strong className="text-[var(--color-foreground)]">Dashboard</strong> —
              active projects at a glance.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Tasks / Backlog
              </strong>{" "}
              — plan and execute delivery work.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Sprints / Roadmap
              </strong>{" "}
              — time-box and sequence work with due dates.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Search</strong> — find
              projects and related work inside APZ Projects.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Documentation</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            APZ Projects is an APZHUB product. Product behaviour and permissions are
            owned by APZHUB — not by any underlying engine. Ask your APZHUB
            administrator for organisation-specific guidance.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => router.push(projectsDashboardPath())}
          >
            Back to Dashboard
          </Button>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Need more help?</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            If something looks wrong, contact your APZHUB administrator. Prefer
            describing the APZ Projects screen and action — never an engine or adapter
            name.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(projectsSettingsPath())}
              data-testid="projects-help-settings"
            >
              Open settings
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(projectsHelpPath())}
            >
              Refresh this page
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
