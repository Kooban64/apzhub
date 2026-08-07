"use client";

import { Button } from "@apzhub/ui";
import { usePathname, useRouter } from "next/navigation";

import {
  projectsAdminAuditPath,
  projectsAdminCompliancePath,
  projectsAdminDelegationsPath,
  projectsAdminGovernancePath,
  projectsAdminHierarchyPath,
  projectsAdminPath,
  projectsAdminPoliciesPath,
  projectsAdminRetentionPath,
  projectsAdminRolesPath,
  projectsAdminSearchesPath,
} from "@/lib/projects/routes";

const LINKS = [
  { href: projectsAdminPath(), label: "Dashboard" },
  { href: projectsAdminGovernancePath(), label: "Profiles" },
  { href: projectsAdminPoliciesPath(), label: "Policies" },
  { href: projectsAdminHierarchyPath(), label: "Hierarchy" },
  { href: projectsAdminDelegationsPath(), label: "Delegations" },
  { href: projectsAdminCompliancePath(), label: "Compliance" },
  { href: projectsAdminAuditPath(), label: "Audit" },
  { href: projectsAdminRetentionPath(), label: "Retention" },
  { href: projectsAdminSearchesPath(), label: "Governed Search" },
  { href: projectsAdminRolesPath(), label: "Roles" },
] as const;

export function ProjectsAdminNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="flex flex-wrap gap-1"
      aria-label="Administration registries"
      data-testid="projects-admin-nav"
    >
      {LINKS.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== projectsAdminPath() && pathname.startsWith(link.href));
        return (
          <Button
            key={link.href}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            onClick={() => router.push(link.href)}
          >
            {link.label}
          </Button>
        );
      })}
    </nav>
  );
}
