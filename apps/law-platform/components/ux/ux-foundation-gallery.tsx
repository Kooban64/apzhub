"use client";

import { useState } from "react";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@apzhub/ui";

import { LawBreadcrumbs } from "./breadcrumbs/law-breadcrumbs";
import {
  LawInformationCard,
  LawQuickActionsCard,
  LawStatisticsCard,
  LawStatusCard,
  LawWarningCard,
} from "./cards/law-cards";
import {
  LawConfirmationDialog,
  LawDeleteDialog,
  LawSuccessDialog,
} from "./dialogs/law-dialogs";
import { LawEmptyState } from "./empty-states/law-empty-state";
import { LawErrorState } from "./error-states/law-error-state";
import { LawFilterBar } from "./filter-bar/law-filter-bar";
import { LawDetailPageLayout } from "./layouts/detail-page-layout";
import { LawFormPageLayout } from "./layouts/form-page-layout";
import { LawListPageLayout } from "./layouts/list-page-layout";
import { LawLoadingSkeleton } from "./loading-states/law-loading-skeleton";
import { LawPageHeader, LawPageHeaderButton } from "./page-header/page-header";
import { LawPagination } from "./pagination/law-pagination";
import { LawSearchBar } from "./search-bar/law-search-bar";
import { LawSidePanel } from "./side-panel/law-side-panel";
import { LawDataTable } from "./data-table/law-data-table";
import { LawTabs } from "./tabs/law-tabs";
import { lawUxTokens } from "./tokens";

const LIST_COLUMNS = [
  { id: "name", header: "Name" },
  { id: "status", header: "Status" },
  { id: "updated", header: "Updated" },
] as const;

const DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "documents", label: "Documents" },
] as const;

/** Interactive catalogue of Law Platform UX foundation patterns (LAW-001-02). */
export function LawUxFoundationGallery() {
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className={lawUxTokens.section} data-testid="law-ux-foundation-gallery">
      <LawPageHeader
        eyebrow="UX Foundation"
        title="Law Platform component catalogue"
        subtitle="Reusable layouts and presentation components for every future module."
        primaryAction={
          <LawPageHeaderButton type="button">Primary action</LawPageHeaderButton>
        }
        secondaryActions={
          <LawPageHeaderButton type="button" variant="outline">
            Secondary
          </LawPageHeaderButton>
        }
      />

      <LawBreadcrumbs
        items={[
          { label: "Law Platform", href: "/workspace/law/dashboard" },
          { label: "Administration", href: "/workspace/law/administration" },
          { label: "UX Foundation", current: true },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <LawStatisticsCard
          label="Registered patterns"
          value="18"
          hint="Layouts + components"
        />
        <LawStatusCard label="Foundation status" status="Ready" tone="success" />
        <LawWarningCard
          title="Foundation only"
          message="These components contain no business logic, data, or API integration."
        />
      </section>

      <LawQuickActionsCard
        actions={
          <>
            <Button type="button" size="sm" onClick={() => setConfirmOpen(true)}>
              Confirm
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSuccessOpen(true)}
            >
              Success
            </Button>
          </>
        }
      />

      <LawInformationCard title="Usage rule">
        <p className={lawUxTokens.subtitle}>
          Every future Law Platform module must compose these layouts and components.
          Modules may not invent alternate page shells.
        </p>
      </LawInformationCard>

      <Card>
        <CardHeader>
          <CardTitle>List page layout</CardTitle>
        </CardHeader>
        <CardContent>
          <LawListPageLayout
            header={
              <LawPageHeader
                title="Example list"
                subtitle="Search, filters, table, pagination"
              />
            }
            table={<LawDataTable columns={LIST_COLUMNS} rowCount={0} />}
            state={<LawEmptyState variant="no-results" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail page layout</CardTitle>
        </CardHeader>
        <CardContent>
          <LawDetailPageLayout
            header={
              <LawPageHeader
                title="Example detail"
                subtitle="Summary, tabs, placeholders"
              />
            }
            summaryCards={
              <>
                <LawStatisticsCard label="Open items" value="0" />
                <LawStatusCard label="Status" status="Placeholder" />
              </>
            }
            tabs={
              <LawTabs
                items={DETAIL_TABS}
                activeId={activeTab}
                onChange={setActiveTab}
              />
            }
            properties={
              <LawInformationCard title="Properties">
                <p className={lawUxTokens.subtitle}>
                  Property fields will be composed by modules.
                </p>
              </LawInformationCard>
            }
            timeline={
              <LawInformationCard title="Timeline">
                <LawLoadingSkeleton rows={3} />
              </LawInformationCard>
            }
            documents={
              <LawInformationCard title="Documents">
                <LawEmptyState variant="no-documents" />
              </LawInformationCard>
            }
            activity={
              <LawInformationCard title="Activity">
                <LawEmptyState variant="coming-soon" />
              </LawInformationCard>
            }
            contextPanel={
              <LawSidePanel
                title="Context"
                open={panelOpen}
                onClose={() => setPanelOpen(false)}
              >
                <LawSearchBar placeholder="Panel search" />
                <div className="mt-4">
                  <LawFilterBar />
                </div>
              </LawSidePanel>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form page layout</CardTitle>
        </CardHeader>
        <CardContent>
          <LawFormPageLayout
            header={
              <LawPageHeader
                title="Example form"
                subtitle="Sections and validation summary"
              />
            }
            validationSummary="Validation messages will appear here when modules add fields."
            sections={
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Section A</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LawSearchBar placeholder="Field placeholder" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Section B</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LawFilterBar />
                  </CardContent>
                </Card>
              </div>
            }
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <LawEmptyState variant="no-clients" />
        <LawEmptyState variant="no-matters" />
        <LawEmptyState variant="coming-soon" />
        <LawErrorState message="Example error presentation for module failures." />
        <LawLoadingSkeleton rows={5} />
        <div className="flex flex-col gap-3">
          <LawSearchBar />
          <LawFilterBar />
          <LawPagination page={1} pageCount={5} />
        </div>
      </section>

      <LawConfirmationDialog
        open={confirmOpen}
        title="Confirm action"
        description="Example confirmation dialog with no business logic."
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      />
      <LawDeleteDialog
        open={deleteOpen}
        title="Delete item"
        description="Example delete dialog — presentation only."
        onConfirm={() => setDeleteOpen(false)}
        onCancel={() => setDeleteOpen(false)}
      />
      <LawSuccessDialog
        open={successOpen}
        title="Saved"
        description="Example success dialog."
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}
