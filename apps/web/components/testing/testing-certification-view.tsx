"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { toTestingUserMessage } from "@/lib/testing/errors";
import { formatTestingDate, formatStatusLabel } from "@/lib/testing/format";
import type { TestingPermissionSource } from "@/lib/testing/permissions";
import { testingQueryKeys } from "@/lib/testing/query-keys";
import { testingCertificationPath } from "@/lib/testing/routes";
import { getCertification, listCertifications } from "@/lib/testing/testing-api";
import type { TestingListParams } from "@/lib/testing/types";

import { TestingCommandsPanel } from "./testing-commands-panel";
import {
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingState,
  PageShell,
  Panel,
  StatusBadge,
  TestingTable,
} from "./testing-ui";

export function TestingCertificationView({
  certificationId,
  permissions,
}: {
  readonly certificationId?: string;
  readonly permissions?: TestingPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const params = useMemo<TestingListParams>(
    () => (search.trim() ? { search: search.trim() } : {}),
    [search],
  );

  const listQuery = useQuery({
    queryKey: testingQueryKeys.certification.list(params),
    queryFn: ({ signal }) => listCertifications(params, { signal }),
    enabled: !certificationId,
  });

  const detailQuery = useQuery({
    queryKey: testingQueryKeys.certification.detail(certificationId ?? ""),
    queryFn: ({ signal }) => getCertification(certificationId ?? "", { signal }),
    enabled: Boolean(certificationId),
  });

  function invalidateCertifications() {
    void queryClient.invalidateQueries({ queryKey: testingQueryKeys.certification.all() });
    void queryClient.invalidateQueries({ queryKey: testingQueryKeys.dashboard() });
    if (certificationId) {
      void queryClient.invalidateQueries({
        queryKey: testingQueryKeys.certification.detail(certificationId),
      });
    }
  }

  if (certificationId) {
    if (detailQuery.isLoading) return <LoadingState />;
    if (detailQuery.isError || !detailQuery.data) {
      return (
        <ErrorState
          message={toTestingUserMessage(detailQuery.error)}
          onRetry={() => void detailQuery.refetch()}
        />
      );
    }

    const certification = detailQuery.data;

    return (
      <PageShell
        title={certification.name}
        description={`Certification ${certification.id}`}
        breadcrumbs={["Certification", certification.name]}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(testingCertificationPath())}
            data-testid="testing-certification-back"
          >
            Back to certifications
          </Button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="State">
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">State</dt>
                <dd>
                  <StatusBadge status={certification.state} />
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-muted-foreground)]">Updated</dt>
                <dd>{formatTestingDate(certification.updatedAt)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Recommendation">
            <p className="text-sm text-[var(--color-foreground)]">
              <StatusBadge status={certification.recommendation} />
            </p>
            {certification.recommendationAdvisoryOnly ? (
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                Advisory only — does not override gate evaluation or approval workflow.
              </p>
            ) : null}
          </Panel>
        </div>

        <Panel title="Gates">
          {certification.gates.length === 0 ? (
            <EmptyState title="No gates evaluated" />
          ) : (
            <TestingTable
              caption="Certification gates"
              columns={["Gate", "Status", "Reason", "Evaluator", "Evaluated"]}
              rows={certification.gates.map((gate) => ({
                id: gate.id,
                cells: [
                  gate.name,
                  <StatusBadge key="status" status={gate.status} />,
                  gate.reason,
                  gate.evaluator,
                  formatTestingDate(gate.evaluatedAt),
                ],
              }))}
            />
          )}
        </Panel>

        <Panel title="Approval history">
          {certification.approvals.length === 0 ? (
            <EmptyState title="No approval decisions" />
          ) : (
            <TestingTable
              caption="Approval history"
              columns={["Stage", "Decision", "Actor", "Decided", "Comment"]}
              rows={certification.approvals.map((approval) => ({
                id: approval.id,
                cells: [
                  formatStatusLabel(approval.stage),
                  <StatusBadge key="decision" status={approval.decision} />,
                  approval.actor,
                  formatTestingDate(approval.decidedAt),
                  approval.comment ?? "—",
                ],
              }))}
            />
          )}
        </Panel>

        <Panel title="Audit history">
          {certification.audit.length === 0 ? (
            <EmptyState title="No audit events" />
          ) : (
            <TestingTable
              caption="Audit history"
              columns={["Action", "Actor", "At", "Detail"]}
              rows={certification.audit.map((entry) => ({
                id: entry.id,
                cells: [
                  formatStatusLabel(entry.action),
                  entry.actor,
                  formatTestingDate(entry.at),
                  entry.detail,
                ],
              }))}
            />
          )}
        </Panel>

        <Panel title="Commands">
          <TestingCommandsPanel
            permissions={permissions}
            variant="certification"
            context={{ certificationId: certification.id }}
            onSuccess={invalidateCertifications}
          />
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Certification"
      description="Release certification records with gates and approval workflow."
    >
      <FilterBar>
        <Input
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="testing-certification-search"
        />
      </FilterBar>

      {listQuery.isLoading ? <LoadingState /> : null}
      {listQuery.isError ? (
        <ErrorState
          message={toTestingUserMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
        />
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length === 0 ? (
        <EmptyState title="No certifications found" />
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length > 0 ? (
        <TestingTable
          caption="Certifications"
          columns={["Name", "State", "Recommendation", "Gates", "Updated"]}
          rows={listQuery.data.items.map((item) => ({
            id: item.id,
            cells: [
              item.name,
              <StatusBadge key="state" status={item.state} />,
              <StatusBadge key="rec" status={item.recommendation} />,
              String(item.gates.length),
              formatTestingDate(item.updatedAt),
            ],
          }))}
          onRowClick={(id) => router.push(testingCertificationPath(id))}
        />
      ) : null}
    </PageShell>
  );
}
