import type { ZammadCapabilityCertification, ZammadCapabilityAvailability } from "./types";

const VERSION_MIN = "6.3.0";
const VERSION_MAX = "6.5.x";

interface CapabilitySpec {
  readonly capabilityId: string;
  readonly serviceId: string;
  readonly optional: boolean;
  readonly supportedOperations: readonly string[];
  readonly unsupportedOperations: readonly string[];
  readonly dependencyRequirements: readonly string[];
  readonly configurationRequirements: readonly string[];
  readonly knownLimitations: readonly string[];
  readonly testEvidenceRef: string;
}

const CAPABILITY_SPECS: readonly CapabilitySpec[] = [
  {
    capabilityId: "support",
    serviceId: "support",
    optional: false,
    supportedOperations: [
      "listSupportRequests",
      "getSupportRequest",
      "createSupportRequest",
      "updateSupportRequest",
      "closeSupportRequest",
      "reopenSupportRequest",
      "assignSupportRequest",
    ],
    unsupportedOperations: ["deleteSupportRequest"],
    dependencyRequirements: ["rest_client", "operation_runner", "auth"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: [
      "Ticket delete is not exposed through the Support domain contract",
      "Binary attachment transfer is out of scope",
    ],
    testEvidenceRef: "tests/zammad-support-core.test.ts",
  },
  {
    capabilityId: "organizations",
    serviceId: "organizations",
    optional: false,
    supportedOperations: [
      "listOrganizations",
      "getOrganization",
      "createOrganization",
      "updateOrganization",
    ],
    unsupportedOperations: ["deleteOrganization"],
    dependencyRequirements: ["rest_client", "operation_runner", "auth"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: ["Organization delete is not exposed"],
    testEvidenceRef: "tests/zammad-support-core.test.ts",
  },
  {
    capabilityId: "groups",
    serviceId: "groups",
    optional: false,
    supportedOperations: ["listGroups", "getGroup", "createGroup", "updateGroup"],
    unsupportedOperations: ["deleteGroup"],
    dependencyRequirements: ["rest_client", "operation_runner", "auth"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: ["Group delete is not exposed"],
    testEvidenceRef: "tests/zammad-support-core.test.ts",
  },
  {
    capabilityId: "users",
    serviceId: "users",
    optional: false,
    supportedOperations: [
      "listSupportUsers",
      "getSupportUser",
      "createSupportUser",
      "updateSupportUser",
    ],
    unsupportedOperations: ["deleteSupportUser", "provisionFromPlatformIdentity"],
    dependencyRequirements: ["rest_client", "operation_runner", "auth"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: [
      "User delete is not exposed",
      "Platform identity provisioning is out of scope",
    ],
    testEvidenceRef: "tests/zammad-support-core.test.ts",
  },
  {
    capabilityId: "articles",
    serviceId: "articles",
    optional: false,
    supportedOperations: [
      "listArticles",
      "getArticle",
      "createInternalNote",
      "createCustomerReply",
    ],
    unsupportedOperations: [
      "updateArticle",
      "deleteArticle",
      "transferBinaryAttachment",
    ],
    dependencyRequirements: ["rest_client", "operation_runner", "auth", "support"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: [
      "Article update and delete are unsupported",
      "Attachment metadata only — binary transfer not implemented",
      "Internal notes must never become customer-visible",
    ],
    testEvidenceRef: "tests/zammad-articles.test.ts",
  },
  {
    capabilityId: "search",
    serviceId: "search",
    optional: true,
    supportedOperations: ["searchSupportRequests", "searchOrganizations", "searchUsers"],
    unsupportedOperations: ["semanticSearch", "crossEngineSearch"],
    dependencyRequirements: ["rest_client", "operation_runner", "auth"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: [
      "Read-only search over support domain kinds only",
      "No Platform Search Service registration in this milestone",
    ],
    testEvidenceRef: "tests/zammad-search-history-analytics.test.ts",
  },
  {
    capabilityId: "history",
    serviceId: "history",
    optional: true,
    supportedOperations: ["listSupportRequestHistory"],
    unsupportedOperations: ["mutateHistory", "deleteHistory"],
    dependencyRequirements: ["rest_client", "operation_runner", "auth", "support"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: [
      "Read-only chronological history",
      "Unknown history event types are preserved safely",
    ],
    testEvidenceRef: "tests/zammad-search-history-analytics.test.ts",
  },
  {
    capabilityId: "analytics",
    serviceId: "analytics",
    optional: true,
    supportedOperations: ["getSupportIntelligenceSnapshot"],
    unsupportedOperations: ["authoritativeSlaCalculation", "customReportEngine"],
    dependencyRequirements: ["rest_client", "operation_runner", "auth", "support"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: [
      "Some metrics are heuristic — not authoritative SLA calculations",
      "SLA-dependent metrics may be unavailable without Zammad SLA data",
    ],
    testEvidenceRef: "tests/zammad-search-history-analytics.test.ts",
  },
  {
    capabilityId: "webhooks",
    serviceId: "webhooks",
    optional: true,
    supportedOperations: [
      "listWebhooks",
      "getWebhook",
      "createWebhook",
      "updateWebhook",
      "deleteWebhook",
      "validateWebhook",
    ],
    unsupportedOperations: ["webhookHttpIngress", "platformEventPublication"],
    dependencyRequirements: ["rest_client", "operation_runner", "auth"],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: [
      "Webhook registration/management only",
      "HTTP ingress is not implemented",
      "Platform Event Bus publication is not implemented",
      "Webhook secrets never appear in diagnostics",
    ],
    testEvidenceRef: "tests/zammad-sync-events-webhooks.test.ts",
  },
  {
    capabilityId: "events",
    serviceId: "events",
    optional: false,
    supportedOperations: ["translateProviderEvent", "listSupportedEventTypes"],
    unsupportedOperations: [
      "platformEventPublication",
      "platformEventSubscription",
    ],
    dependencyRequirements: ["canonical_event_contracts"],
    configurationRequirements: [],
    knownLimitations: [
      "Canonical event translation only — no Platform Event Bus",
      "Unknown events are handled safely without throwing",
    ],
    testEvidenceRef: "tests/zammad-sync-events-webhooks.test.ts",
  },
  {
    capabilityId: "synchronisation",
    serviceId: "synchronisation",
    optional: false,
    supportedOperations: [
      "runFullSync",
      "runIncrementalSync",
      "getSyncDiagnostics",
      "resetInMemorySyncState",
    ],
    unsupportedOperations: [
      "persistentSyncState",
      "backgroundWorker",
      "scheduler",
      "articleSync",
    ],
    dependencyRequirements: [
      "rest_client",
      "operation_runner",
      "auth",
      "support",
      "organizations",
      "groups",
      "users",
    ],
    configurationRequirements: ["baseUrl", "apiToken"],
    knownLimitations: [
      "In-memory sync state only — not durable across process restarts",
      "No workers or schedulers",
      "Article sync is not implemented",
      "Entities covered: support requests, organisations, groups, support users",
    ],
    testEvidenceRef: "tests/zammad-sync-events-webhooks.test.ts",
  },
];

export interface CertifyZammadCapabilitiesInput {
  readonly serviceAvailable: (serviceId: string) => boolean;
  readonly featureDetection?: {
    readonly unavailableCapabilities: readonly string[];
  };
  readonly providerReachable: boolean;
  readonly authenticationValid: boolean;
}

function resolveStatus(
  implemented: boolean,
  optional: boolean,
  featureUnavailable: boolean,
  providerReachable: boolean,
  authenticationValid: boolean,
): {
  status: ZammadCapabilityAvailability;
  degraded: boolean;
  available: boolean;
  reasons: string[];
} {
  if (!implemented) {
    return {
      status: "unavailable",
      degraded: false,
      available: false,
      reasons: ["capability_not_implemented"],
    };
  }

  if (!authenticationValid || !providerReachable) {
    return {
      status: optional ? "optional_unavailable" : "unavailable",
      degraded: false,
      available: false,
      reasons: !authenticationValid
        ? ["authentication_invalid"]
        : ["provider_unreachable"],
    };
  }

  if (featureUnavailable) {
    return {
      status: optional ? "optional_unavailable" : "unavailable",
      degraded: optional,
      available: false,
      reasons: ["feature_detection_unavailable"],
    };
  }

  return {
    status: "available",
    degraded: false,
    available: true,
    reasons: [],
  };
}

/**
 * Certify every registered Zammad capability for operational reporting.
 */
export function certifyZammadCapabilities(
  input: CertifyZammadCapabilitiesInput,
): readonly ZammadCapabilityCertification[] {
  return CAPABILITY_SPECS.map((spec) => {
    const implemented = input.serviceAvailable(spec.serviceId);
    const featureUnavailable =
      input.featureDetection?.unavailableCapabilities.includes(spec.capabilityId) ??
      false;
    const resolved = resolveStatus(
      implemented,
      spec.optional,
      featureUnavailable,
      input.providerReachable,
      input.authenticationValid,
    );

    return {
      capabilityId: spec.capabilityId,
      serviceId: spec.serviceId,
      implemented,
      registered: implemented,
      available: resolved.available,
      enabled: implemented && resolved.available,
      certificationStatus: resolved.status,
      status: resolved.status,
      supportedOperations: [...spec.supportedOperations],
      unsupportedOperations: [...spec.unsupportedOperations],
      optional: spec.optional,
      degraded: resolved.degraded,
      degradationReasons: resolved.degraded ? [...resolved.reasons] : [],
      dependencyRequirements: [...spec.dependencyRequirements],
      minimumZammadVersion: VERSION_MIN,
      maximumVerifiedZammadVersion: VERSION_MAX,
      editionApplicability: ["community", "enterprise"] as const,
      configurationRequirements: [...spec.configurationRequirements],
      knownLimitations: [...spec.knownLimitations],
      testEvidenceRef: spec.testEvidenceRef,
      reasons: [...resolved.reasons],
    };
  });
}

/** Binary attachments remain a placeholder — never falsely certified. */
export function certifyAttachmentPlaceholder(): ZammadCapabilityCertification {
  return {
    capabilityId: "attachments",
    serviceId: "attachments",
    implemented: false,
    registered: false,
    available: false,
    enabled: false,
    certificationStatus: "unavailable",
    status: "unavailable",
    supportedOperations: [],
    unsupportedOperations: [
      "uploadBinaryAttachment",
      "downloadBinaryAttachment",
      "deleteBinaryAttachment",
    ],
    optional: true,
    degraded: false,
    degradationReasons: [],
    dependencyRequirements: [],
    minimumZammadVersion: VERSION_MIN,
    maximumVerifiedZammadVersion: VERSION_MAX,
    editionApplicability: ["community", "enterprise"],
    configurationRequirements: [],
    knownLimitations: [
      "Binary attachment transfer is explicitly out of scope",
      "Attachment metadata is available via the articles capability",
    ],
    testEvidenceRef: "tests/zammad-operations.test.ts",
    reasons: ["placeholder_not_implemented"],
  };
}
