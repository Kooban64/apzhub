"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@apzhub/ui";

import type { PlatformControlPlaneSnapshot } from "@/lib/platform-operations/types";

import { OpsJsonPanel, OpsPageShell, OpsStatCard, OpsStatusBadge, OpsTable } from "./ops-ui";

export function ControlPlaneOverviewSection({
  controlPlane,
  summaryCounts,
}: {
  readonly controlPlane: PlatformControlPlaneSnapshot;
  readonly summaryCounts: {
    readonly tenants: number;
    readonly users: number;
    readonly modules: number;
    readonly services: number;
    readonly products: number;
  };
}) {
  const degradedCapabilities = controlPlane.capabilities.filter(
    (capability) => capability.status !== "healthy",
  );

  return (
    <OpsPageShell
      title="Platform Operations Control Plane"
      description="Unified operational visibility — health, readiness, capabilities, and production verification."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OpsStatCard label="Platform health" value={controlPlane.overview.platformHealth} />
        <OpsStatCard
          label="Production readiness"
          value={controlPlane.overview.productionReadiness}
        />
        <OpsStatCard
          label="Readiness score"
          value={`${controlPlane.overview.readinessScore}%`}
        />
        <OpsStatCard label="Environment" value={controlPlane.environment} />
        {controlPlane.overview.lifecycleState ? (
          <OpsStatCard label="Lifecycle state" value={controlPlane.overview.lifecycleState} />
        ) : null}
        {controlPlane.overview.maintenanceMode !== undefined ? (
          <OpsStatCard
            label="Maintenance mode"
            value={controlPlane.overview.maintenanceMode ? "enabled" : "disabled"}
          />
        ) : null}
        <OpsStatCard label="Tenants" value={summaryCounts.tenants} />
        <OpsStatCard label="Users" value={summaryCounts.users} />
        <OpsStatCard label="Modules" value={summaryCounts.modules} />
        <OpsStatCard label="Products" value={summaryCounts.products} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-3">
            <OpsStatusBadge status={controlPlane.productionVerification.verdict} />
            <span>Pass: {controlPlane.productionVerification.summary.passCount}</span>
            <span>Warnings: {controlPlane.productionVerification.summary.warnCount}</span>
            <span>Failures: {controlPlane.productionVerification.summary.failCount}</span>
          </div>
          {controlPlane.overview.affectedProducts.length > 0 ? (
            <p>Affected products: {controlPlane.overview.affectedProducts.join(", ")}</p>
          ) : (
            <p>No product-specific degradation detected.</p>
          )}
        </CardContent>
      </Card>

      {controlPlane.lifecycle ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Platform lifecycle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-3">
                <OpsStatusBadge status={controlPlane.lifecycle.currentState} />
                <span>Shutdown: {controlPlane.lifecycle.shutdownStatus}</span>
                <span>Recovery: {controlPlane.lifecycle.recoveryStatus}</span>
                <span>
                  Version compatible:{" "}
                  {controlPlane.lifecycle.versionCompatibility.compatible ? "yes" : "no"}
                </span>
              </div>
              {controlPlane.lifecycle.recommendations.length > 0 ? (
                <p>{controlPlane.lifecycle.recommendations[0]}</p>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Readiness gates</CardTitle>
              </CardHeader>
              <CardContent>
                <OpsTable
                  columns={["Gate", "Satisfied", "Message"]}
                  rows={controlPlane.lifecycle.readinessGates.map((gate) => [
                    gate.gate,
                    gate.satisfied ? "yes" : "no",
                    gate.message,
                  ])}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product lifecycle participation</CardTitle>
              </CardHeader>
              <CardContent>
                <OpsTable
                  columns={["Product", "Lifecycle", "Readiness"]}
                  rows={controlPlane.lifecycle.products.map((product) => [
                    product.name,
                    product.lifecycleState,
                    product.readiness,
                  ])}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Capability lifecycle participation</CardTitle>
            </CardHeader>
            <CardContent>
              <OpsTable
                columns={["Capability", "Order", "Lifecycle", "Readiness", "Shutdown", "Recovery"]}
                rows={controlPlane.lifecycle.capabilities.map((capability) => [
                  capability.name,
                  String(capability.sequenceOrder),
                  capability.lifecycleState,
                  capability.readiness,
                  capability.shutdownStatus,
                  capability.recoveryStatus,
                ])}
              />
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Capability status</CardTitle>
        </CardHeader>
        <CardContent>
          <OpsTable
            columns={["Capability", "Health", "Readiness", "Owner", "Warnings"]}
            rows={controlPlane.capabilities.map((capability) => [
              capability.name,
              capability.health,
              capability.readiness,
              capability.owner,
              String(capability.warnings.length),
            ])}
          />
        </CardContent>
      </Card>

      {degradedCapabilities.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Degraded capabilities — recommended actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {degradedCapabilities.map((capability) => (
              <div key={capability.capabilityId}>
                <p className="font-medium">{capability.name}</p>
                <p className="text-muted-foreground">
                  {capability.recommendations[0] ??
                    capability.warnings[0] ??
                    "Review capability diagnostics."}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dependency health</CardTitle>
          </CardHeader>
          <CardContent>
            <OpsTable
              columns={["Dependency", "Status"]}
              rows={controlPlane.dependencyHealth.dependencies.map((dependency) => [
                dependency.name,
                dependency.status,
              ])}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding technical debt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Open items: {controlPlane.technicalDebt.openCount}</p>
            <p className="text-muted-foreground">{controlPlane.technicalDebt.registerReference}</p>
            <OpsTable
              columns={["ID", "Priority", "Summary"]}
              rows={controlPlane.technicalDebt.openItems.slice(0, 6).map((item) => [
                item.id,
                item.priority,
                item.summary,
              ])}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentation status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <OpsStatusBadge status={controlPlane.documentation.status} />
          <ul className="list-disc pl-5">
            {controlPlane.documentation.operationsGuides.map((guide) => (
              <li key={guide}>{guide}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <OpsJsonPanel value={controlPlane} />
    </OpsPageShell>
  );
}
