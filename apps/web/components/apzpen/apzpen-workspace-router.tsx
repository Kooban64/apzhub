"use client";

import { usePathname } from "next/navigation";

import { ApzpenFindingDetailPage } from "@/components/apzpen/apzpen-finding-detail-page";
import {
  ApzpenCodeSecurityPage,
  ApzpenIntelligencePage,
} from "@/components/apzpen/apzpen-follow-on-pages";
import {
  ApzpenAssetsPage,
  ApzpenEngagementDetailPage,
  ApzpenEngagementsPage,
  ApzpenFindingsPage,
  ApzpenHomePage,
  ApzpenProvidersPage,
  ApzpenReportsPage,
} from "@/components/apzpen/apzpen-pages";
import {
  ApzpenCertificationPage,
  ApzpenEvidencePage,
  ApzpenMyWorkPage,
  ApzpenRemediationPage,
  ApzpenRetestsPage,
  ApzpenRiskAcceptancePage,
} from "@/components/apzpen/apzpen-workflow-pages";
import { parseApzpenWorkbenchPath } from "@/lib/apzpen/workbench-routes";

/**
 * Hosts existing APZPEN page components inside Workbench (Slice 4).
 * No product rewrite — path mapping only.
 */
export function ApzpenWorkspaceRouter() {
  const pathname = usePathname() ?? "";
  const { segment, id } = parseApzpenWorkbenchPath(pathname);

  if (!segment) {
    return <ApzpenHomePage />;
  }

  switch (segment) {
    case "my-work":
      return <ApzpenMyWorkPage />;
    case "engagements":
      return id ? (
        <ApzpenEngagementDetailPage engagementId={id} />
      ) : (
        <ApzpenEngagementsPage />
      );
    case "findings":
      return id ? <ApzpenFindingDetailPage findingId={id} /> : <ApzpenFindingsPage />;
    case "remediation":
      return <ApzpenRemediationPage />;
    case "retests":
      return <ApzpenRetestsPage />;
    case "risk-acceptance":
      return <ApzpenRiskAcceptancePage />;
    case "evidence":
      return <ApzpenEvidencePage />;
    case "certification":
      return <ApzpenCertificationPage />;
    case "assets":
      return <ApzpenAssetsPage />;
    case "code":
      return <ApzpenCodeSecurityPage />;
    case "intelligence":
      return <ApzpenIntelligencePage />;
    case "providers":
      return <ApzpenProvidersPage />;
    case "reports":
      return <ApzpenReportsPage />;
    default:
      return <ApzpenHomePage />;
  }
}
