import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import { connectorHealthDomainId } from "@/lib/provisioning/connectors/health-ids";
import type { ConnectorHealthResult, ConnectorMetadataView, ServiceProvisioningConnector } from "@/lib/provisioning/connectors/types";
import { capabilitySummary } from "@/lib/provisioning/connectors/types";
import { createCalendarSimulatedConnector } from "@/lib/provisioning/connectors/calendar-simulated";
import { createMailSimulatedConnector } from "@/lib/provisioning/connectors/mail-simulated";
import { createDefaultMockConnector } from "@/lib/provisioning/connectors/mock-services";

export type ProvisioningConnectorProfile = "mock" | "simulated" | "vendor_dry_run";

export function getProvisioningConnectorProfile(): ProvisioningConnectorProfile {
  const v = (process.env.APZHUB_PROVISIONING_CONNECTOR_PROFILE ?? "mock").toLowerCase().trim();
  if (v === "simulated") {
    return "simulated";
  }
  if (v === "vendor_dry_run" || v === "vendor-dry-run") {
    return "vendor_dry_run";
  }
  return "mock";
}

function buildRegistry(): {
  byServiceId: Record<string, ServiceProvisioningConnector>;
  fallback: ServiceProvisioningConnector;
  all: ServiceProvisioningConnector[];
} {
  const profile = getProvisioningConnectorProfile();

  if (profile === "vendor_dry_run") {
    const mail = createDefaultMockConnector({
      connectorId: "dry-run.mail.v1",
      displayName: "Mail (dry-run)",
      serviceIds: ["mail"],
      capabilities: { idempotentWrites: true },
    });
    const calendar = createDefaultMockConnector({
      connectorId: "dry-run.calendar.v1",
      displayName: "Calendar (dry-run)",
      serviceIds: ["calendar"],
      capabilities: { idempotentWrites: true },
    });
    const vendorIds = ["plane", "zammad", "kimai", "kiwi", "paperless", "n8n"] as const;
    const vendorConnectors = vendorIds.map((sid) =>
      createDefaultMockConnector({
        connectorId: `dry-run.${sid}.v1`,
        displayName: `${sid} vendor dry-run`,
        serviceIds: [sid],
        capabilities: { idempotentWrites: true },
      }),
    );
    const byServiceId: Record<string, ServiceProvisioningConnector> = { mail, calendar };
    for (const c of vendorConnectors) {
      for (const sid of c.serviceIds) {
        byServiceId[sid] = c;
      }
    }
    const fallback = createDefaultMockConnector({
      connectorId: "dry-run.fallback.v1",
      displayName: "Fallback dry-run",
      serviceIds: ["drive", "reminders", "chat", "*"],
      capabilities: { idempotentWrites: true },
    });
    return {
      byServiceId,
      fallback,
      all: [mail, calendar, ...vendorConnectors, fallback],
    };
  }

  if (profile === "simulated") {
    const mail = createMailSimulatedConnector();
    const calendar = createCalendarSimulatedConnector();
    const fallback = createDefaultMockConnector({
      connectorId: "mock.fallback.v1",
      displayName: "Fallback mock (non-mail/calendar)",
      serviceIds: ["drive", "*"],
    });
    return {
      byServiceId: { mail, calendar },
      fallback,
      all: [mail, calendar, fallback],
    };
  }

  const mail = createDefaultMockConnector({
    connectorId: "mock.mail.v1",
    displayName: "Mail mock connector",
    serviceIds: ["mail"],
  });
  const calendar = createDefaultMockConnector({
    connectorId: "mock.calendar.v1",
    displayName: "Calendar mock connector",
    serviceIds: ["calendar"],
  });
  const fallback = createDefaultMockConnector({
    connectorId: "mock.fallback.v1",
    displayName: "Fallback mock connector",
    serviceIds: ["drive", "*"],
  });
  return {
    byServiceId: { mail, calendar },
    fallback,
    all: [mail, calendar, fallback],
  };
}

/** Metadata for admin/diagnostics (stable ordering). */
export function listConnectors(): ConnectorMetadataView[] {
  const { all } = buildRegistry();
  return all.map((c) => ({
    connectorId: c.connectorId,
    displayName: c.displayName,
    serviceIds: c.serviceIds,
    capabilities: c.capabilities,
  }));
}

export function getConnectorMetadata(serviceId: string): ConnectorMetadataView {
  const c = getConnectorForService(serviceId);
  return {
    connectorId: c.connectorId,
    displayName: c.displayName,
    serviceIds: c.serviceIds,
    capabilities: c.capabilities,
  };
}

export function getConnectorForService(serviceId: string): ServiceProvisioningConnector {
  const { byServiceId, fallback } = buildRegistry();
  return byServiceId[serviceId] ?? fallback;
}

/** Aggregate connector self-checks (also surfaced on admin health strip when provisioning is real). */
export function getProvisioningConnectorsHealth(): ConnectorHealthResult[] {
  const { all } = buildRegistry();
  return all.map((c) => c.getHealth());
}

/** One row per registered connector for `mergeAdapterHealthIntoStrip`. */
export function getProvisioningConnectorHealthAdapterResults(): AdapterHealthResult[] {
  const profile = getProvisioningConnectorProfile();
  const { all } = buildRegistry();
  return all.map((c) => {
    const h = c.getHealth();
    const signal: AdapterHealthResult["signal"] =
      h.signal === "healthy" ? "healthy" : h.signal === "degraded" ? "degraded" : "misconfigured";
    const domain = connectorHealthDomainId(c.connectorId);
    return {
      domain,
      signal,
      label: `Provisioning · ${c.displayName} (${profile})`,
      detail: `${h.detail} · caps=${capabilitySummary(c.capabilities)}`,
    };
  });
}
