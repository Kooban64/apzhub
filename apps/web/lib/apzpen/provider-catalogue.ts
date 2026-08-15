/**
 * CE / OSS provider catalogue for APZPEN — single source for UI + dispatch.
 * Commercial scanners are out of scope.
 */

export type ProviderDiscipline =
  | "DAST"
  | "SAST"
  | "SCA"
  | "SBOM"
  | "Secrets"
  | "IaC"
  | "Network"
  | "TLS"
  | "Cloud"
  | "Kubernetes"
  | "API"
  | "Mobile"
  | "VA"
  | "Specialist"
  | "Source";

export type ProviderIntegrationStatus =
  "ops_cluster" | "ops_optional" | "ingest_ready" | "planned";

export type ApzpenProvider = {
  readonly id: string;
  readonly name: string;
  readonly discipline: ProviderDiscipline;
  readonly status: ProviderIntegrationStatus;
  /** Tools that can be dry-run / live-dispatched via runner-dispatch */
  readonly dispatchable: boolean;
  readonly notes?: string;
};

export const APZPEN_PROVIDERS: readonly ApzpenProvider[] = [
  {
    id: "zap",
    name: "OWASP ZAP",
    discipline: "DAST",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "trivy",
    name: "Trivy",
    discipline: "SCA",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "semgrep",
    name: "Semgrep",
    discipline: "SAST",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "nuclei",
    name: "Nuclei",
    discipline: "DAST",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "greenbone",
    name: "Greenbone / OpenVAS CE",
    discipline: "VA",
    status: "ingest_ready",
    dispatchable: false,
    notes:
      "Operator scan (gvm-tools/script) → artefact ingest; GMP API deferred; dispatchable false",
  },
  {
    id: "faraday",
    name: "Faraday",
    discipline: "Specialist",
    status: "ingest_ready",
    dispatchable: false,
    notes: "ENT-001 — artefact ingest via @apzhub/integration-faraday; compose planned",
  },
  {
    id: "gitleaks",
    name: "Gitleaks",
    discipline: "Secrets",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "syft",
    name: "Syft",
    discipline: "SBOM",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "grype",
    name: "Grype",
    discipline: "SCA",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "osv",
    name: "OSV-Scanner",
    discipline: "SCA",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "checkov",
    name: "Checkov",
    discipline: "IaC",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "nmap",
    name: "Nmap",
    discipline: "Network",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "testssl",
    name: "testssl.sh",
    discipline: "TLS",
    status: "ops_cluster",
    dispatchable: true,
  },
  {
    id: "prowler",
    name: "Prowler",
    discipline: "Cloud",
    status: "ops_optional",
    dispatchable: true,
  },
  {
    id: "kubebench",
    name: "kube-bench",
    discipline: "Kubernetes",
    status: "ops_optional",
    dispatchable: true,
  },
  {
    id: "schemathesis",
    name: "Schemathesis",
    discipline: "API",
    status: "ops_optional",
    dispatchable: true,
  },
  {
    id: "mobsf",
    name: "MobSF",
    discipline: "Mobile",
    status: "ops_cluster",
    dispatchable: true,
    notes: "Mobile app SAST/DAST — APK/IPA/ZIP under scope; UI :8000",
  },
  {
    id: "kali",
    name: "Kali (jobs only)",
    discipline: "Specialist",
    status: "ops_optional",
    dispatchable: false,
    notes: "Specialist job image — not a product module",
  },
  {
    id: "github",
    name: "GitHub",
    discipline: "Source",
    status: "ingest_ready",
    dispatchable: false,
    notes: "App JWT install token or PAT · live PR sync · HMAC webhook",
  },
] as const;

export const DISPATCHABLE_TOOLS = APZPEN_PROVIDERS.filter((p) => p.dispatchable).map(
  (p) => p.id,
);

/** Client-safe list of dispatch tool ids (mirrors runner-dispatch). */
export const ALL_DISPATCH_TOOLS = [
  "zap",
  "trivy",
  "semgrep",
  "nuclei",
  "gitleaks",
  "syft",
  "grype",
  "osv",
  "checkov",
  "nmap",
  "testssl",
  "prowler",
  "kubebench",
  "schemathesis",
  "mobsf",
] as const;

export type CatalogueDispatchTool = (typeof ALL_DISPATCH_TOOLS)[number];

export function providerStatusLabel(status: ProviderIntegrationStatus): string {
  switch (status) {
    case "ops_cluster":
      return "Ops cluster";
    case "ops_optional":
      return "Ops optional profile";
    case "ingest_ready":
      return "Ingest ready";
    case "planned":
      return "Planned";
  }
}
