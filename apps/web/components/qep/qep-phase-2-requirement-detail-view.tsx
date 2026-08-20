"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { QEP_REQUIREMENTS_ROUTES } from "@apzhub/qep-requirements/presentation";

import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import {
  getLifecycleHistory,
  getAvailableTransitions,
  transitionRequirement,
} from "@/lib/qep/qep-api";
import {
  createAcceptanceCriterion,
  createUserStory,
  getRequirementDefinition,
  patchAcceptanceCriterion,
  patchUserStory,
  type PresentedCriterion,
  type PresentedStory,
} from "@/lib/qep/qep-definition-api";
import { useWorkbenchInspector } from "@/lib/workbench/workbench-inspector";
import { QepErrorState, QepLoadingState, QepStatusBadge } from "./qep-ui";

type DetailTab =
  | "details"
  | "stories"
  | "criteria"
  | "tests"
  | "plans"
  | "executions"
  | "defects"
  | "attachments"
  | "history";

const TABS: readonly { readonly id: DetailTab; readonly label: string }[] = [
  { id: "details", label: "Details" },
  { id: "stories", label: "User Stories" },
  { id: "criteria", label: "Acceptance Criteria" },
  { id: "tests", label: "Test Cases" },
  { id: "plans", label: "Test Plans" },
  { id: "executions", label: "Executions" },
  { id: "defects", label: "Defects" },
  { id: "attachments", label: "Attachments" },
  { id: "history", label: "History" },
];

const MOBILE_TABS: readonly DetailTab[] = ["details", "stories", "criteria", "tests"];

function titleCase(value: string): string {
  return value.replaceAll("_", " ");
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const delta = Date.now() - date.getTime();
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}

function ownerLabel(display?: string, id?: string): string {
  return display?.trim() || (id ? "Unavailable" : "—");
}

function StoryForm({
  onSubmit,
  pending,
}: {
  readonly onSubmit: (values: {
    title: string;
    description: string;
    storyType: string;
    priority: string;
  }) => void;
  readonly pending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyType, setStoryType] = useState("feature");
  const [priority, setPriority] = useState("medium");
  return (
    <form
      className="space-y-2 rounded-md border border-[var(--color-border)] p-3 text-xs"
      data-testid="qep-add-story-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ title, description, storyType, priority });
        setTitle("");
        setDescription("");
      }}
    >
      <input
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Story title"
        className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description"
        className="min-h-[4rem] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
      />
      <div className="flex gap-2">
        <select
          value={storyType}
          onChange={(event) => setStoryType(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
        >
          <option value="feature">Feature</option>
          <option value="technical">Technical</option>
          <option value="spike">Spike</option>
        </select>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-md bg-[var(--color-primary)] px-3 font-medium text-[var(--color-primary-foreground)]"
        >
          Add User Story
        </button>
      </div>
    </form>
  );
}

function CriterionForm({
  onSubmit,
  pending,
  label,
}: {
  readonly onSubmit: (text: string) => void;
  readonly pending: boolean;
  readonly label: string;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      data-testid="qep-add-criterion-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onSubmit(text.trim());
        setText("");
      }}
    >
      <input
        required
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Acceptance criterion"
        className="h-9 min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
      >
        {label}
      </button>
    </form>
  );
}

export function QepPhase2RequirementDetailView({
  requirementId,
}: {
  readonly requirementId: string;
}) {
  const client = useQueryClient();
  const { selected, displayContext } = useQepApplicationContext();
  const inspector = useWorkbenchInspector();
  const [tab, setTab] = useState<DetailTab>("details");
  const [addingStory, setAddingStory] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [_selectedCriterionId, setSelectedCriterionId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["qep-requirement-definition", requirementId],
    queryFn: () => getRequirementDefinition(requirementId),
  });
  const historyQ = useQuery({
    queryKey: ["qep-requirement-lifecycle", requirementId],
    queryFn: () => getLifecycleHistory(requirementId),
    enabled: tab === "history",
  });
  const transitionsQ = useQuery({
    queryKey: ["qep-requirement-transitions", requirementId],
    queryFn: () => getAvailableTransitions(requirementId),
  });

  const createStoryM = useMutation({
    mutationFn: createUserStory,
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ["qep-requirement-definition", requirementId],
      });
      setAddingStory(false);
    },
  });
  const createAcM = useMutation({
    mutationFn: createAcceptanceCriterion,
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ["qep-requirement-definition", requirementId],
      });
    },
  });
  const patchStoryM = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      patchUserStory(id, body),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ["qep-requirement-definition", requirementId],
      });
    },
  });
  const patchAcM = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      patchAcceptanceCriterion(id, body),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ["qep-requirement-definition", requirementId],
      });
    },
  });

  const data = query.data;
  const item = data?.requirement;
  const stories = data?.stories ?? [];
  const criteria = data?.criteria ?? [];
  const selectedStory = stories.find((row) => row.id === selectedStoryId) ?? null;
  const storyCriteria = useMemo(
    () =>
      selectedStory
        ? criteria.filter((row) => row.userStoryId === selectedStory.id)
        : [],
    [criteria, selectedStory],
  );
  const directCriteria = useMemo(
    () => criteria.filter((row) => !row.userStoryId),
    [criteria],
  );
  const verificationCount = criteria.reduce(
    (sum, row) => sum + row.verificationCount,
    0,
  );

  function showStoryInspector(story: PresentedStory) {
    setSelectedStoryId(story.id);
    inspector.setSelection({
      id: story.id,
      title: story.storyKey,
      content: (
        <div
          className="flex h-full min-h-0 flex-col text-xs"
          data-testid="qep-story-inspector"
        >
          <p className="font-medium">{story.storyKey}</p>
          <h2 className="mt-2 text-sm font-semibold">{story.title}</h2>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 capitalize">
              {titleCase(story.status)}
            </span>
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 capitalize">
              {titleCase(story.storyType)}
            </span>
            <span className="rounded border border-[var(--color-border)] px-1.5 py-0.5 capitalize">
              {titleCase(story.priority)}
            </span>
          </div>
          {story.description ? <p className="mt-3">{story.description}</p> : null}
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
              <dd>{ownerLabel(undefined, story.ownerUserId)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Estimate</dt>
              <dd>
                {typeof story.estimatePoints === "number"
                  ? `${story.estimatePoints} SP`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Created</dt>
              <dd>{formatRelativeTime(story.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Updated</dt>
              <dd>{formatRelativeTime(story.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">
                Acceptance Criteria
              </dt>
              <dd>
                {story.criterionCount === 0
                  ? "—"
                  : `${story.coveredCount} covered / ${story.gapCount} gaps`}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Coverage</dt>
              <dd className="capitalize">{titleCase(story.coverage)}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="mt-4 h-8 rounded-md border border-[var(--color-border)] px-3"
            onClick={() =>
              patchStoryM.mutate({ id: story.id, body: { archive: true } })
            }
          >
            Archive
          </button>
        </div>
      ),
    });
  }

  function showCriterionInspector(criterion: PresentedCriterion) {
    setSelectedCriterionId(criterion.id);
    inspector.setSelection({
      id: criterion.id,
      title: criterion.criterionKey,
      content: (
        <div
          className="flex h-full min-h-0 flex-col text-xs"
          data-testid="qep-criterion-inspector"
        >
          <p className="font-medium">{criterion.criterionKey}</p>
          <p className="mt-2 text-sm">{criterion.text}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Required</dt>
              <dd>{criterion.required ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Coverage</dt>
              <dd className="capitalize">{titleCase(criterion.coverage)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Latest result</dt>
              <dd className="capitalize">{titleCase(criterion.result)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">
                Verification assets
              </dt>
              <dd>{criterion.verificationCount || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Parent story</dt>
              <dd>
                {criterion.userStoryId
                  ? (stories.find((row) => row.id === criterion.userStoryId)
                      ?.storyKey ?? "—")
                  : "Requirement"}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            className="mt-4 h-8 rounded-md border border-[var(--color-border)] px-3"
            onClick={() =>
              patchAcM.mutate({ id: criterion.id, body: { archive: true } })
            }
          >
            Archive
          </button>
        </div>
      ),
    });
  }

  if (query.isLoading) return <QepLoadingState label="Loading requirement…" />;
  if (query.isError || !item) {
    return (
      <QepErrorState
        message={
          query.error instanceof Error ? query.error.message : "Requirement not found"
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  const applicationName = selected?.name ?? displayContext(item.projectId);
  const visibleTabs = TABS;
  const coverageLine =
    data.coverage.criterionCount === 0
      ? "—"
      : `${data.coverage.coveredCount} covered · ${data.coverage.gapCount} gaps`;

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-4 bg-[var(--color-muted)] p-5"
      data-testid="qep-requirement-detail"
    >
      <nav className="text-xs text-[var(--color-muted-foreground)]">
        <Link href={QEP_REQUIREMENTS_ROUTES.list} className="underline">
          Requirements
        </Link>
        <span> / {item.key}</span>
      </nav>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{item.title}</h1>
            <QepStatusBadge status={item.status} />
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs capitalize text-[var(--color-muted-foreground)]">
            <span>{titleCase(item.type)}</span>
            <span>{titleCase(item.priority)}</span>
          </div>
        </div>
        <Link
          href={QEP_REQUIREMENTS_ROUTES.edit(item.id)}
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs"
        >
          Edit
        </Link>
      </header>

      <div
        className="hidden flex-wrap gap-4 lg:flex"
        role="tablist"
        data-testid="qep-requirement-detail-tabs"
      >
        {visibleTabs.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={`border-b-2 px-0.5 pb-1.5 text-sm ${
              tab === entry.id
                ? "border-[var(--color-foreground)] font-medium"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 lg:hidden" role="tablist">
        {MOBILE_TABS.map((id) => (
          <button
            key={id}
            type="button"
            className={`border-b-2 px-0.5 pb-1 text-sm ${
              tab === id
                ? "border-[var(--color-foreground)] font-medium"
                : "border-transparent text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setTab(id)}
          >
            {TABS.find((entry) => entry.id === id)?.label}
          </button>
        ))}
        <select
          className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs"
          value={MOBILE_TABS.includes(tab) ? "more" : tab}
          onChange={(event) => setTab(event.target.value as DetailTab)}
          aria-label="More sections"
        >
          <option value="more">More</option>
          {TABS.filter((entry) => !MOBILE_TABS.includes(entry.id)).map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>

      {tab === "details" ? (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="space-y-4 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Requirement ID
                </dt>
                <dd>{item.key}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Application
                </dt>
                <dd>{applicationName}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">Type</dt>
                <dd className="capitalize">{titleCase(item.type)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Priority
                </dt>
                <dd className="capitalize">{titleCase(item.priority)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">Status</dt>
                <dd className="capitalize">{titleCase(item.status)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">Owner</dt>
                <dd>{ownerLabel(item.owner?.displayName, item.owner?.userId)}</dd>
              </div>
            </dl>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Description
              </h2>
              <p className="mt-1">{item.description || "—"}</p>
            </div>
          </div>
          <aside className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs">
            <h2 className="font-medium">Quick Overview</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt>User Stories</dt>
                <dd>{stories.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Acceptance Criteria</dt>
                <dd>{data.coverage.criterionCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Coverage</dt>
                <dd>{coverageLine}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Verification links</dt>
                <dd>{verificationCount || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Evidence</dt>
                <dd>—</dd>
              </div>
              <div className="flex justify-between">
                <dt>Defects</dt>
                <dd>—</dd>
              </div>
            </dl>
            <h3 className="pt-2 font-medium">Traceability</h3>
            <p className="text-[var(--color-muted-foreground)]">
              {verificationCount > 0
                ? `${verificationCount} verification asset link(s) from acceptance criteria.`
                : "No verification assets are linked to these criteria yet."}
            </p>
          </aside>
        </div>
      ) : null}

      {tab === "stories" ? (
        <div className="min-h-0 flex-1 space-y-3" data-testid="qep-user-stories">
          <div className="flex justify-end">
            <button
              type="button"
              className="h-8 rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
              onClick={() => setAddingStory((value) => !value)}
              data-testid="qep-add-user-story"
            >
              + Add User Story
            </button>
          </div>
          {addingStory && selected ? (
            <StoryForm
              pending={createStoryM.isPending}
              onSubmit={(values) =>
                createStoryM.mutate({
                  applicationId: selected.id,
                  requirementId: item.id,
                  title: values.title,
                  description: values.description || undefined,
                  storyType: values.storyType,
                  priority: values.priority,
                })
              }
            />
          ) : null}
          <div className="hidden overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
            <table className="min-w-full text-xs" data-testid="qep-user-stories-table">
              <thead className="text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Estimate</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {stories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8">
                      No user stories yet.
                    </td>
                  </tr>
                ) : (
                  stories.map((story) => (
                    <tr
                      key={story.id}
                      className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40"
                      onClick={() => showStoryInspector(story)}
                      data-testid={`qep-story-row-${story.id}`}
                    >
                      <td className="px-3 py-2.5 font-medium">{story.storyKey}</td>
                      <td className="px-3 py-2.5">{story.title}</td>
                      <td className="px-3 py-2.5 capitalize">
                        {titleCase(story.storyType)}
                      </td>
                      <td className="px-3 py-2.5 capitalize">
                        {titleCase(story.status)}
                      </td>
                      <td className="px-3 py-2.5 capitalize">
                        {titleCase(story.priority)}
                      </td>
                      <td className="px-3 py-2.5">
                        {typeof story.estimatePoints === "number"
                          ? `${story.estimatePoints} SP`
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {ownerLabel(undefined, story.ownerUserId)}
                      </td>
                      <td className="px-3 py-2.5">
                        {formatRelativeTime(story.updatedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ul
            className="flex flex-col gap-2 lg:hidden"
            data-testid="qep-user-stories-cards"
          >
            {stories.map((story) => (
              <li key={story.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left"
                  onClick={() => showStoryInspector(story)}
                >
                  <p className="text-[11px] text-[var(--color-muted-foreground)]">
                    {story.storyKey}
                  </p>
                  <p className="text-sm font-medium">{story.title}</p>
                </button>
              </li>
            ))}
          </ul>
          {selectedStory ? (
            <section
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              data-testid="qep-story-acceptance-criteria"
            >
              <h2 className="text-sm font-medium">
                Acceptance Criteria · {selectedStory.storyKey}
              </h2>
              <table className="mt-2 min-w-full text-xs">
                <thead className="text-left text-[10px] uppercase text-[var(--color-muted-foreground)]">
                  <tr>
                    <th className="py-1">ID</th>
                    <th className="py-1">Criterion</th>
                    <th className="py-1">Required</th>
                    <th className="py-1">Coverage</th>
                    <th className="py-1">Latest result</th>
                  </tr>
                </thead>
                <tbody>
                  {storyCriteria.map((criterion) => (
                    <tr
                      key={criterion.id}
                      className="cursor-pointer border-t border-[var(--color-border)]"
                      onClick={() => showCriterionInspector(criterion)}
                    >
                      <td className="py-2 font-medium">{criterion.criterionKey}</td>
                      <td className="py-2">{criterion.text}</td>
                      <td className="py-2">{criterion.required ? "Yes" : "No"}</td>
                      <td className="py-2 capitalize">
                        {titleCase(criterion.coverage)}
                      </td>
                      <td className="py-2 capitalize">{titleCase(criterion.result)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selected ? (
                <CriterionForm
                  pending={createAcM.isPending}
                  label="Add Acceptance Criterion"
                  onSubmit={(text) =>
                    createAcM.mutate({
                      applicationId: selected.id,
                      requirementId: item.id,
                      userStoryId: selectedStory.id,
                      text,
                    })
                  }
                />
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}

      {tab === "criteria" ? (
        <div className="min-h-0 flex-1 space-y-3" data-testid="qep-acceptance-criteria">
          <div className="overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table
              className="min-w-full text-xs"
              data-testid="qep-acceptance-criteria-table"
            >
              <thead className="text-left text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Criterion</th>
                  <th className="px-3 py-2">Required</th>
                  <th className="px-3 py-2">Parent</th>
                  <th className="px-3 py-2">Coverage</th>
                  <th className="px-3 py-2">Latest result</th>
                </tr>
              </thead>
              <tbody>
                {criteria.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8">
                      No acceptance criteria yet.
                    </td>
                  </tr>
                ) : (
                  criteria.map((criterion) => (
                    <tr
                      key={criterion.id}
                      className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/40"
                      onClick={() => showCriterionInspector(criterion)}
                      data-testid={`qep-criterion-row-${criterion.id}`}
                    >
                      <td className="px-3 py-2.5 font-medium">
                        {criterion.criterionKey}
                      </td>
                      <td className="px-3 py-2.5">{criterion.text}</td>
                      <td className="px-3 py-2.5">
                        {criterion.required ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2.5">
                        {criterion.userStoryId
                          ? (stories.find((row) => row.id === criterion.userStoryId)
                              ?.storyKey ?? "Story")
                          : "Requirement"}
                      </td>
                      <td className="px-3 py-2.5 capitalize">
                        {titleCase(criterion.coverage)}
                      </td>
                      <td className="px-3 py-2.5 capitalize">
                        {titleCase(criterion.result)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {selected ? (
            <CriterionForm
              pending={createAcM.isPending}
              label="Add Acceptance Criterion"
              onSubmit={(text) =>
                createAcM.mutate({
                  applicationId: selected.id,
                  requirementId: item.id,
                  text,
                })
              }
            />
          ) : null}
          {directCriteria.length > 0 ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {directCriteria.length} criterion(s) remain directly under this
              requirement (no invented story parent).
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "tests" ? (
        <p
          className="text-sm text-[var(--color-muted-foreground)]"
          data-testid="qep-requirement-tests"
        >
          {verificationCount > 0
            ? `${verificationCount} existing specification/verification asset(s) are linked from acceptance criteria. Test Case redesign is Phase 3.`
            : "No verification assets are linked from acceptance criteria. Test Case redesign is Phase 3."}
        </p>
      ) : null}
      {tab === "plans" ||
      tab === "executions" ||
      tab === "defects" ||
      tab === "attachments" ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No durable {tab} relationship is exposed from this requirement yet.
        </p>
      ) : null}
      {tab === "history" ? (
        <ol className="space-y-2 text-sm">
          {(historyQ.data ?? []).map((entry) => (
            <li
              key={entry.id}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            >
              {titleCase(entry.action)} · {entry.createdAt}
            </li>
          ))}
          {historyQ.isSuccess && (historyQ.data?.length ?? 0) === 0 ? (
            <li>No lifecycle history yet.</li>
          ) : null}
          {(data.audit ?? []).map((entry) => (
            <li
              key={entry.id}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            >
              {entry.action} · {formatRelativeTime(entry.createdAt)}
            </li>
          ))}
        </ol>
      ) : null}

      {transitionsQ.data && transitionsQ.data.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {transitionsQ.data.map((transition) => (
            <button
              key={transition.action}
              type="button"
              className="h-8 rounded-md border border-[var(--color-border)] px-3 text-xs"
              data-testid={`qep-lifecycle-action-${transition.action}`}
              onClick={() =>
                void transitionRequirement(item.id, {
                  action: transition.action,
                  expectedRevision: item.revision,
                }).then(() =>
                  client.invalidateQueries({
                    queryKey: ["qep-requirement-definition", requirementId],
                  }),
                )
              }
            >
              {titleCase(transition.action)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
