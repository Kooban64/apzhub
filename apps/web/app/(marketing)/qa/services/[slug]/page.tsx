import { notFound } from "next/navigation";

import {
  MarketingCtaGroup,
  MarketingEyebrow,
  MarketingHeading,
  MarketingLead,
  MarketingSection,
} from "@/components/marketing/marketing-ui";

const SERVICES: Record<
  string,
  { title: string; lead: string; points: readonly string[] }
> = {
  "manual-testing": {
    title: "Manual Testing",
    lead: "Human judgment for journeys that matter — edge cases, accessibility nuance, and product feel.",
    points: [
      "Critical path & regression charters",
      "Exploratory sessions with evidence capture",
      "Defect triage aligned to your release train",
    ],
  },
  "automation-testing": {
    title: "Automation Testing",
    lead: "Automation that pays for itself — maintainable suites, not brittle one-offs.",
    points: [
      "Framework selection & design",
      "CI/CD and environment wiring",
      "API + UI regression coverage strategy",
    ],
  },
  "performance-testing": {
    title: "Performance Testing",
    lead: "Know how the system behaves before your users find out the hard way.",
    points: [
      "Load, stress, and soak scenarios",
      "Bottleneck analysis with engineering partners",
      "Release go/no-go performance criteria",
    ],
  },
  "security-testing": {
    title: "Security Testing",
    lead: "Shift-left security checks in the QA programme — complementary to APZPenTest.",
    points: [
      "Threat-informed test charters",
      "AuthZ / session / input validation focus",
      "Escalation path to offensive pentest packs",
    ],
  },
  "mobile-testing": {
    title: "Mobile Testing",
    lead: "Device reality: OS fragmentation, offline modes, store policies, and UX polish.",
    points: [
      "Device lab & OS matrix planning",
      "Gesture / interrupt / permission scenarios",
      "Release checklist for app stores",
    ],
  },
};

export default async function QaServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = SERVICES[slug];
  if (!service) notFound();

  return (
    <MarketingSection className="pt-20">
      <MarketingEyebrow>APZQA service</MarketingEyebrow>
      <MarketingHeading as="h1">{service.title}</MarketingHeading>
      <MarketingLead>{service.lead}</MarketingLead>
      <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
        {service.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <MarketingCtaGroup
        primary={{ href: "/contact?intent=qa", label: "Request this service" }}
        secondary={{ href: "/qa/services", label: "All QA services" }}
      />
    </MarketingSection>
  );
}
