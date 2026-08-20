"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { PresentedCriterion } from "@apzhub/qep-definition";
import { QEP_TEST_SPECIFICATION_ROUTES } from "@apzhub/qep-test-specifications/presentation";

import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  createTestCase,
  getTestCase,
  linkTestCaseCriterion,
  updateTestCase,
} from "@/lib/qep/qep-test-management-api";
import { QepErrorState, QepLoadingState } from "./qep-ui";

type DesignerTab =
  | "details"
  | "preconditions"
  | "testdata"
  | "steps"
  | "expected"
  | "links"
  | "history"
  | "more";

type StepDraft = {
  order: number;
  action: string;
  testDataRef: string;
  expectedResult: string;
};

function titleCase(value: string): string {
  return value.replaceAll("_", " ");
}

async function listCriteria(
  applicationId: string,
): Promise<readonly PresentedCriterion[]> {
  const response = await fetch(
    `/api/v1/qep/acceptance-criteria?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  const body = (await response.json()) as {
    data?: readonly PresentedCriterion[];
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(body.error?.message ?? "Failed to list criteria");
  return body.data ?? [];
}

export function QepPhase3TestCaseDesignerView({
  testCaseId,
}: {
  readonly testCaseId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedId } = useQepApplicationContext();
  const isNew = !testCaseId;
  const [tab, setTab] = useState<DesignerTab>("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("functional");
  const [priority, setPriority] = useState("medium");
  const [preconditions, setPreconditions] = useState("");
  const [steps, setSteps] = useState<StepDraft[]>([
    { order: 1, action: "", testDataRef: "", expectedResult: "" },
  ]);
  const [criterionId, setCriterionId] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const detailQ = useQuery({
    queryKey: ["qep-test-case", testCaseId],
    enabled: Boolean(testCaseId),
    queryFn: () => getTestCase(testCaseId!),
  });

  const criteriaQ = useQuery({
    queryKey: ["qep-acceptance-criteria", selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => listCriteria(selectedId!),
  });

  useEffect(() => {
    if (!detailQ.data || hydrated) return;
    setTitle(detailQ.data.title);
    setDescription(detailQ.data.description);
    setType(detailQ.data.type);
    setPriority(detailQ.data.priority);
    setPreconditions(detailQ.data.preconditions.join("\n"));
    setSteps(
      detailQ.data.steps.length > 0
        ? detailQ.data.steps.map((step) => ({
            order: step.order,
            action: step.action,
            testDataRef: step.testDataRef ?? "",
            expectedResult: step.expectedResult,
          }))
        : [{ order: 1, action: "", testDataRef: "", expectedResult: "" }],
    );
    setHydrated(true);
  }, [detailQ.data, hydrated]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        description,
        type,
        priority,
        preconditions: preconditions
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        steps: steps
          .filter((step) => step.action.trim() && step.expectedResult.trim())
          .map((step, index) => ({
            order: index + 1,
            action: step.action.trim(),
            ...(step.testDataRef.trim()
              ? { testDataRef: step.testDataRef.trim() }
              : {}),
            expectedResult: step.expectedResult.trim(),
          })),
      };
      if (isNew) {
        if (!selectedId) throw new Error("Select an application");
        return createTestCase({ applicationId: selectedId, ...payload });
      }
      return updateTestCase(testCaseId, payload);
    },
    onSuccess: async (row) => {
      await queryClient.invalidateQueries({ queryKey: ["qep-test-cases"] });
      if (isNew) router.push(QEP_TEST_SPECIFICATION_ROUTES.detail(row.id));
      else setHydrated(false);
    },
  });

  const linkAc = useMutation({
    mutationFn: () => linkTestCaseCriterion(testCaseId!, criterionId),
    onSuccess: async () => {
      setCriterionId("");
      await queryClient.invalidateQueries({ queryKey: ["qep-test-case", testCaseId] });
    },
  });

  const testDataCount = steps.filter((step) => step.testDataRef.trim()).length;
  const desktopTabs = useMemo(
    () =>
      [
        ["details", "Details"],
        ["preconditions", "Preconditions"],
        ["testdata", `Test Data (${testDataCount})`],
        ["steps", `Steps (${steps.filter((step) => step.action.trim()).length})`],
        [
          "expected",
          `Expected Results (${steps.filter((step) => step.expectedResult.trim()).length})`,
        ],
        ["links", `Links (${detailQ.data?.criterionIds.length ?? 0})`],
        ["history", "History"],
      ] as const,
    [detailQ.data?.criterionIds.length, steps, testDataCount],
  );

  if (!selectedId && isNew) {
    return (
      <div className="p-5 text-sm" data-testid="qep-test-case-designer">
        Select an application before adding a test case.
      </div>
    );
  }
  if (testCaseId && detailQ.isLoading)
    return <QepLoadingState label="Loading test case…" />;
  if (testCaseId && detailQ.isError) {
    return <QepErrorState message={(detailQ.error as Error).message} />;
  }

  const row = detailQ.data;
  const number = row?.number ?? "New";

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-test-case-designer"
    >
      <div className="text-xs text-[var(--color-muted-foreground)]">
        <Link href={QEP_TEST_SPECIFICATION_ROUTES.home}>Test Cases</Link>
        {" / "}
        {number}
      </div>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {number} {title || row?.title || "Test Case"}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {description || row?.description || "Reusable verification definition."}
          </p>
          <div className="mt-2 flex flex-wrap gap-1 text-[10px] uppercase">
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5">
              {titleCase(row?.status ?? "draft")}
            </span>
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5">
              {titleCase(type)}
            </span>
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5">
              {row?.automationMappings.length ? "Mapped" : "Manual capable"}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          data-testid="qep-test-case-save"
        >
          {isNew ? "Create Test Case" : "Save"}
        </button>
      </header>

      <div className="hidden flex-wrap gap-4 lg:flex" role="tablist">
        {desktopTabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`border-b-2 px-0.5 pb-1.5 text-sm ${
              tab === id
                ? "border-[var(--color-foreground)] font-medium"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 lg:hidden" role="tablist">
        {(
          [
            ["details", "Details"],
            ["preconditions", "Preconditions"],
            ["steps", "Steps"],
            ["more", "More"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`border-b-2 px-0.5 pb-1.5 text-sm ${
              tab === id ||
              (id === "more" &&
                ["testdata", "expected", "links", "history"].includes(tab))
                ? "border-[var(--color-foreground)] font-medium"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setTab(id === "more" ? "links" : id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
        {tab === "details" ? (
          <div
            className="grid gap-4 lg:grid-cols-3"
            data-testid="qep-test-case-details"
          >
            <label className="grid gap-1 text-xs">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-9 rounded-md border border-[var(--color-border)] px-3"
              />
            </label>
            <label className="grid gap-1 text-xs">
              Type
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="h-9 rounded-md border border-[var(--color-border)] px-2"
              >
                <option value="functional">Functional</option>
                <option value="regression">Regression</option>
                <option value="integration">Integration</option>
                <option value="security">Security</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs">
              Priority
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="h-9 rounded-md border border-[var(--color-border)] px-2"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs lg:col-span-3">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-20 rounded-md border border-[var(--color-border)] px-3 py-2"
              />
            </label>
            <p className="text-xs text-[var(--color-muted-foreground)] lg:col-span-3">
              Environment and execution infrastructure are assigned on the Test Plan
              Execution Strategy, not on this Test Case.
            </p>
            <dl className="grid grid-cols-2 gap-2 text-xs lg:col-span-3">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Used by Suites</dt>
                <dd>{row?.suiteIds.length ?? 0}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Used by Plans</dt>
                <dd>{row?.planIds.length ?? 0}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Last result</dt>
                <dd className="capitalize">
                  {titleCase(row?.lastResult ?? "not_run")}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {tab === "preconditions" ? (
          <label className="grid gap-1 text-xs">
            Preconditions
            <textarea
              value={preconditions}
              onChange={(event) => setPreconditions(event.target.value)}
              className="min-h-40 rounded-md border border-[var(--color-border)] px-3 py-2"
              placeholder="One condition per line"
            />
          </label>
        ) : null}

        {tab === "steps" || tab === "testdata" || tab === "expected" ? (
          <div data-testid="qep-test-case-steps">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs"
                onClick={() =>
                  setSteps((current) => [
                    ...current,
                    {
                      order: current.length + 1,
                      action: "",
                      testDataRef: "",
                      expectedResult: "",
                    },
                  ])
                }
              >
                + Add Step
              </button>
            </div>
            <div className="hidden lg:block">
              <table className="min-w-full text-xs">
                <thead className="text-left text-[10px] uppercase text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="py-2">#</th>
                    <th>Action</th>
                    <th>Test Data</th>
                    <th>Expected Result</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, index) => (
                    <tr key={index} className="border-t border-[var(--color-border)]">
                      <td className="py-2 pr-2">{index + 1}</td>
                      <td>
                        <input
                          value={step.action}
                          onChange={(event) =>
                            setSteps((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, action: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="h-8 w-full rounded border border-[var(--color-border)] px-2"
                        />
                      </td>
                      <td>
                        <input
                          value={step.testDataRef}
                          onChange={(event) =>
                            setSteps((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, testDataRef: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="h-8 w-full rounded border border-[var(--color-border)] px-2"
                        />
                      </td>
                      <td>
                        <input
                          value={step.expectedResult}
                          onChange={(event) =>
                            setSteps((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, expectedResult: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="h-8 w-full rounded border border-[var(--color-border)] px-2"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 lg:hidden">
              {steps.map((step, index) => (
                <article
                  key={index}
                  className="rounded-md border border-[var(--color-border)] p-3"
                >
                  <p className="text-xs font-medium">Step {index + 1}</p>
                  <p className="mt-1 text-xs">{step.action || "Action"}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {step.testDataRef || "No test data"}
                  </p>
                  <p className="text-xs">{step.expectedResult || "Expected result"}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "links" || tab === "more" ? (
          <div data-testid="qep-test-case-ac-links">
            <h2 className="text-sm font-medium">Verifies Acceptance Criteria</h2>
            {row?.criterionIds.length ? (
              <ul className="mt-2 space-y-1 text-xs">
                {row.criterionIds.map((id) => {
                  const criterion = criteriaQ.data?.find((item) => item.id === id);
                  return (
                    <li key={id}>
                      {criterion?.criterionKey ?? id}
                      {criterion?.text ? ` ${criterion.text}` : ""}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                No Acceptance Criteria linked.
              </p>
            )}
            {testCaseId ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={criterionId}
                  onChange={(event) => setCriterionId(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] px-2 text-xs"
                >
                  <option value="">Select AC</option>
                  {(criteriaQ.data ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.criterionKey} {item.text}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-md border border-[var(--color-border)] px-3 text-xs"
                  disabled={!criterionId || linkAc.isPending}
                  onClick={() => linkAc.mutate()}
                >
                  + Add Link
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs">
                Save the Test Case before linking Acceptance Criteria.
              </p>
            )}
          </div>
        ) : null}

        {tab === "history" ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Historical identity {row?.number ?? "will be allocated as TS-*"} is
            preserved. Definition version {row?.definitionVersion ?? 1}.
          </p>
        ) : null}

        {save.isError ? (
          <p className="mt-3 text-xs text-red-600">{(save.error as Error).message}</p>
        ) : null}
      </div>
    </div>
  );
}
