/**
 * Stream 1 Solutions pillars — public catalogue routes (UX-STREAM-001 §4–7).
 */

export type SolutionPillarId = "quality" | "security" | "productivity";

export type SolutionPillar = {
  readonly id: SolutionPillarId;
  readonly href: string;
  readonly brand: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly cta: { readonly href: string; readonly label: string };
  readonly marketplaceFilter: string;
};

export const SOLUTION_PILLARS: readonly SolutionPillar[] = [
  {
    id: "quality",
    href: "/solutions/quality",
    brand: "APZQEP",
    title: "Quality Assurance",
    eyebrow: "QUALITY ASSURANCE",
    summary:
      "Understand whether software is genuinely ready to release — quality engineering, testing, and release assurance.",
    highlights: [
      "Quality Engineering",
      "Test Management",
      "Automation",
      "Source & GitHub Integration",
      "Evidence",
      "Release Certification",
    ],
    cta: { href: "/marketplace?pillar=quality", label: "Explore Quality" },
    marketplaceFilter: "quality",
  },
  {
    id: "security",
    href: "/solutions/security",
    brand: "APZPEN",
    title: "Security Assurance",
    eyebrow: "SECURITY ASSURANCE",
    summary:
      "Discover, manage and prove application security — penetration testing and continuous security assurance.",
    highlights: [
      "Penetration Testing",
      "Application Security",
      "Source Security",
      "Vulnerability Management",
      "Remediation",
      "Security Certification",
    ],
    cta: { href: "/marketplace?pillar=security", label: "Explore Security" },
    marketplaceFilter: "security",
  },
  {
    id: "productivity",
    href: "/solutions/productivity",
    brand: "APZPRD",
    title: "Productivity",
    eyebrow: "PRODUCTIVITY",
    summary:
      "Give every person one workspace for their work — projects, support, time, workflow, analytics and knowledge.",
    highlights: ["Projects", "Support", "Time", "Workflow", "Analytics", "Knowledge"],
    cta: {
      href: "/marketplace?pillar=productivity",
      label: "Explore Productivity",
    },
    marketplaceFilter: "productivity",
  },
] as const;

export function getSolutionPillar(id: string): SolutionPillar | undefined {
  return SOLUTION_PILLARS.find((p) => p.id === id);
}
